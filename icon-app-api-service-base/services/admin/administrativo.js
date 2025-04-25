/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
const Stream = require("stream");
const ExcelJS = require("exceljs");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const mime = require("mime-types");
const Handler = require("../handler");
const Logger = require("../../auth/logService");
const userController = require("../../auth/userController");
const models = require("../../models");

const { Empresas, Usuario_Migrar } = models;
const { Materiais_Associados, Roles } = models;

const rowsByPage = 10;
const { BUCKET_MATERIAIS_EXCLUSIVOS } = process.env;

const getUsers = async () => {
  let users = [];

  const filter = {
    attributes: ["id", "nome", "email", "cognito_id", "createdAt"],
    raw: true,
  };
  await Usuario_Migrar.findAll(filter)
    .then((result) => {
      users = result;
    })
    .catch((error) => {
      console.error(error);
    });

  return users;
};

const getUsersByRole = async (filter = {}) => {
  let users = [];

  filter = {
    ...filter,
    raw: true,
  };
  await Usuario_Migrar.findAll(filter)
    .then((result) => {
      users = result;
    })
    .catch((error) => {
      console.error(error);
    });

  return users;
};

const getCompanies = async () => {
  let companies = [];

  const filter = {
    raw: true,
  };
  await Empresas.findAll(filter)
    .then((result) => {
      companies = result;
    })
    .catch((error) => {
      console.error(error);
    });

  return companies;
};

const parse_queries = (event) => {
  let currentPage = 1;
  let searchText = "";

  if (event.queryStringParameters) {
    const { q } = event.queryStringParameters;
    let { page } = event.queryStringParameters;
    try {
      page = parseInt(page, 10);
      if (!Number.isInteger(page)) {
        page = 1;
      }
    } catch (e) {
      page = 1;
    }
    currentPage = page > 1 ? page : 1;
    searchText = q && q.length > 0 ? q : "";
  }

  return {
    currentPage,
    searchText,
  };
};

const parse_count = async (query, parameters, currentPage, itemsPage) => {
  const countResponse = await userController.raw_query(query, parameters);
  const rows = countResponse[0].total;
  const totalPages =
    Math.trunc(rows / itemsPage) + (rows % itemsPage > 0 ? 1 : 0);
  const offset = currentPage > totalPages ? 0 : itemsPage * (currentPage - 1);

  return { rows, totalPages, offset };
};

const parseLog = (resource, searchText, rows, currentPage, totalPages) => {
  let log = `Carregando ${resource}. `;
  if (searchText.length > 0) {
    log += `Pesquisado por [${searchText}]. Resultados encontrados: ${rows}. `;
  }
  log += `Página [${
    // eslint-disable-next-line no-nested-ternary
    rows > 0 ? (currentPage > totalPages ? 1 : currentPage) : 0
  }] de [${totalPages}]`;

  return log;
};

module.exports.getDashboard = async (event, action, api = false) => {
  try {
    let response = {};

    const usersPromise = getUsers();
    const companiesPromise = getCompanies();
    const associadosPromise = getUsersByRole({
      include: {
        model: Roles,
        as: "roles",
        required: true,
        attributes: [],
        where: {
          name: "associado",
        },
      },
    });

    const accessByDayPromise = userController.raw_query(`
    SELECT 
        Helper_Calendar.datefield as data, 
        LOG_BY_DATE.access_count as acessos
    FROM Helper_Calendar
        LEFT JOIN (
        SELECT 
          DATE(CONVERT_TZ(Usuario_Log.createdAt, '+00:00','-3:00')) as access_date, 
          COUNT(DISTINCT Usuario_Log.id_usuario) as access_count
          FROM Usuario_Log
          GROUP BY DATE(CONVERT_TZ(Usuario_Log.createdAt, '+00:00','-3:00'))
        ) AS LOG_BY_DATE ON Helper_Calendar.datefield = LOG_BY_DATE.access_date
    WHERE
    Helper_Calendar.datefield BETWEEN DATE_SUB(Date(CONVERT_TZ(current_timestamp(), '+00:00','-3:00')), INTERVAL 29 DAY)
          AND DATE(CONVERT_TZ(current_timestamp(), '+00:00','-3:00'))
    GROUP BY 1 ORDER BY 1 DESC
    `);
    const usersActivePromise = userController.raw_query(
      "SELECT\n" +
        "   UL.id_usuario,\n" +
        "   (SELECT UM.nome FROM Usuario_Migrar AS UM WHERE UM.id = UL.id_usuario) AS nome,\n" +
        "   (SELECT UM.email FROM Usuario_Migrar AS UM WHERE UM.id = UL.id_usuario) AS email,\n" +
        "   (SELECT UM.contador FROM Usuario_Migrar AS UM WHERE UM.id = UL.id_usuario) AS contador,\n" +
        "   (SELECT R.name FROM Users_Roles as UR INNER JOIN Roles as R ON UR.role_id = R.id WHERE UR.user_id = UL.id_usuario) AS profile,\n" +
        "   (SELECT CONVERT_TZ(UM.createdAt, '+00:00','-3:00') FROM Usuario_Migrar AS UM WHERE UM.id = UL.id_usuario) AS registerDate,\n" +
        "   (SELECT CONVERT_TZ(MAX(UL2.createdAt), '+00:00','-3:00') FROM Usuario_Log AS UL2 WHERE UL.id_usuario = UL2.id_usuario) AS lastAccess,\n" +
        "   (SELECT count(EU.id) FROM Empresa_Usuarios as EU WHERE EU.UsuarioId = UL.id_usuario AND EU.active = 1 AND (EU.accept = 1 OR EU.owner = 1)) as companies,\n" +
        "   count(DISTINCT Date(CONVERT_TZ(UL.createdAt, '+00:00','-3:00'))) AS acessos\n" +
        "FROM Usuario_Log AS UL\n" +
        "WHERE Date(CONVERT_TZ(UL.createdAt, '+00:00','-3:00')) > DATE_SUB(Date(CONVERT_TZ(current_timestamp(), '+00:00','-3:00')), INTERVAL 30 DAY)\n" +
        "GROUP BY 1 ORDER BY acessos DESC;"
    );
    const companiesActivePromise = userController.raw_query(
      "SELECT\n" +
        "E.id, E.nome, E.cnpj,\n" +
        "  (SELECT EP.data_final_premium FROM Empresas_Premium AS EP WHERE EP.company_id = UL.context ORDER BY EP.createdAt desc LIMIT 1) AS premiumFinal,\n" +
        "   (SELECT EP.empresa_homologada FROM Empresas_Premium AS EP WHERE EP.company_id = UL.context ORDER BY EP.createdAt desc LIMIT 1) AS empresa_homologada,\n" +
        "   (SELECT CONVERT_TZ(MAX(UL2.createdAt), '+00:00','-3:00') FROM Usuario_Log AS UL2 WHERE UL2.context = UL.context) AS lastAccess,\n" +
        "   (SELECT count(EU.id) FROM Empresa_Usuarios as EU WHERE EU.EmpresaId = UL.context AND EU.active = 1 AND (EU.accept = 1 OR EU.owner = 1)) as usuariosAtivos,\n" +
        "   COUNT(UL.id) AS acessos\n" +
        "FROM Usuario_Log AS UL INNER JOIN Empresas AS E ON UL.context = E.id\n" +
        "WHERE \n" +
        "   UL.action = 'load_company' AND UL.status = 'success'\n" +
        "   AND Date(CONVERT_TZ(UL.createdAt, '+00:00','-3:00')) > DATE_SUB(Date(CONVERT_TZ(current_timestamp(), '+00:00','-3:00')), INTERVAL 30 DAY)\n" +
        "GROUP BY 1, 2, 3 ORDER BY acessos DESC, lastAccess DESC, nome;"
    );
    const requestsAssociatePromise = userController.raw_query(
      "SELECT\n" +
        "    Usuario_Upgrade.id as request_id, Usuario_Upgrade.user_id, Usuario_Upgrade.company_id,\n" +
        "    Usuario_Upgrade.name, Usuario_Upgrade.phone, Usuario_Upgrade.crc, Usuario_Migrar.email,\n" +
        "    Usuario_Upgrade.createdAt, Empresas.nome as companyName, Empresas.cnpj as companyCnpj\n" +
        "FROM\n" +
        "    Usuario_Upgrade\n" +
        "    INNER JOIN Usuario_Migrar on Usuario_Upgrade.user_id = Usuario_Migrar.id\n" +
        "    INNER JOIN Empresas on Usuario_Upgrade.company_id = Empresas.id\n" +
        "WHERE\n" +
        "    Usuario_Upgrade.status = 0\n" +
        "ORDER BY Usuario_Upgrade.createdAt ASC\n"
    );
    const logsTodayPromise = userController.raw_query(
      "SELECT Usuario_Log.id,  Usuario_Migrar.nome, Usuario_Log.action, Usuario_Log.status, Usuario_Log.log,\n" +
        "   Empresas.nome as contexto, CONVERT_TZ(Usuario_Log.createdAt, '+00:00','-3:00') as createdAt\n" +
        "FROM Usuario_Log inner join Usuario_Migrar on Usuario_Log.id_usuario = Usuario_Migrar.id left join Empresas on Usuario_Log.context = Empresas.id\n" +
        "WHERE  Date(CONVERT_TZ(Usuario_Log.createdAt, '+00:00','-3:00')) >= Date(CONVERT_TZ(current_timestamp(), '+00:00','-3:00'))\n" +
        "ORDER BY 7 DESC, 1 desc"
    );
    const newUsersByDatePromise = userController.raw_query(`
      CALL CountNewUsersByDate(
        DATE_SUB(Date(CONVERT_TZ(current_timestamp(), '+00:00','-3:00')), INTERVAL 15 DAY), 
        Date(CONVERT_TZ(current_timestamp(), '+00:00','-3:00'))
      );
    `);
    const newCompaniesByDatePromise = userController.raw_query(`
    CALL CountNewCompaniesByDate(
      DATE_SUB(Date(CONVERT_TZ(current_timestamp(), '+00:00','-3:00')), INTERVAL 15 DAY), 
      Date(CONVERT_TZ(current_timestamp(), '+00:00','-3:00'))
    );
  `);
    const newUsersByMonthPromise = userController.raw_query(
      `CALL CountNewUsersByMonth();`
    );
    const newCompaniesByPromise = userController.raw_query(
      `CALL CountNewCompaniesByMonth();`
    );

    const companiesStatusPromise = userController.raw_query(`
      SELECT empresa_homologada, COUNT(Empresas.id) as companies
      FROM Empresas 
          LEFT JOIN Empresas_Premium ON (Empresas.id = Empresas_Premium.company_id)
          AND (Empresas_Premium.data_final_premium > now() OR Empresas_Premium.data_final_premium IS NULL)
      GROUP BY 1;
    `);

    const promiseAllArray = [
      usersPromise,
      companiesPromise,
      accessByDayPromise,
      associadosPromise,
      usersActivePromise,
      companiesActivePromise,
      requestsAssociatePromise,
      logsTodayPromise,
      newUsersByDatePromise,
      newCompaniesByDatePromise,
      newUsersByMonthPromise,
      newCompaniesByPromise,
      companiesStatusPromise,
    ];
    await Promise.all(promiseAllArray).then(async (values) => {
      const [
        users,
        companies,
        accessByDay,
        associados,
        usersActives,
        companiesActives,
        requestsAssociate,
        logsToday,
        newUsersByDate,
        newCompaniesByDate,
        newUsersByMonth,
        newCompaniesByMonth,
        companiesStatus,
      ] = values;

      const responseNewUsersByDate = {
        title: "Usuários",
        labels: [],
        data: [],
      };

      const keysUsersByData = Object.values(newUsersByDate[0]);
      keysUsersByData.forEach((date) => {
        const [dateField, value] = Object.values(date);
        responseNewUsersByDate.labels.push(dateField);
        responseNewUsersByDate.data.push(value);
      });

      const responseNewUsersByMonth = {
        title: "Usuários",
        labels: [],
        data: [],
      };
      const monthsUsers = Object.values(newUsersByMonth[0]).splice(
        Object.values(newUsersByMonth[0]).length - 12
      );
      monthsUsers.forEach((date) => {
        const [dateField, value] = Object.values(date);
        responseNewUsersByMonth.labels.push(dateField);
        responseNewUsersByMonth.data.push(value);
      });

      const responseNewCompaniesByDate = {
        title: "Empresas",
        labels: [],
        data: [],
      };
      Object.values(newCompaniesByDate[0]).forEach((date) => {
        const [dateField, value] = Object.values(date);
        responseNewCompaniesByDate.labels.push(dateField);
        responseNewCompaniesByDate.data.push(value);
      });

      const responseNewCompaniesByMonth = {
        title: "Empresas",
        labels: [],
        data: [],
      };
      const monthsCompanies = Object.values(newCompaniesByMonth[0]).splice(
        Object.values(newCompaniesByMonth[0]).length - 12
      );
      monthsCompanies.forEach((date) => {
        const [dateField, value] = Object.values(date);
        responseNewCompaniesByMonth.labels.push(dateField);
        responseNewCompaniesByMonth.data.push(value);
      });

      companiesStatus.forEach((statusCompany, index, array) => {
        const [status, count] = Object.values(statusCompany);
        let label = "start";
        if (status === 0) label = "premium";
        if (status === 1) label = "associada";
        if (status === 2) label = "trial";
        array[index] = {
          status,
          count,
          label,
        };
      });

      response = {
        status: "success",
        dashboard: {
          users: users.length,
          companies: companies.length,
          access_by_day: accessByDay,
          associados: associados.length,
          usersActives: usersActives.slice(0, 10),
          usersActivesTotal: usersActives.length,
          companiesActives: companiesActives.slice(0, 10),
          companiesActivesTotal: companiesActives.length,
          requestsAssociate,
          newUsersByDate: responseNewUsersByDate,
          newUsersByMonth: responseNewUsersByMonth,
          newCompaniesByDate: responseNewCompaniesByDate,
          newCompaniesByMonth: responseNewCompaniesByMonth,
          companiesStatus,
        },
      };

      if (api) {
        response = {
          ...response,
          dashboard: {
            ...response.dashboard,
            logsToday,
          },
        };
      }
    });

    if (api) return response;

    await Logger.setSuccessLog(action, `Carregando Dashboard Administrativo`);
    return Handler.Ok(response);
  } catch (error) {
    return Handler.Exception(action, error);
  }
};

module.exports.getAssociados = async (event, action) => {
  const itemsPage = rowsByPage;

  const { currentPage, searchText } = parse_queries(event);
  const searchTextSql =
    searchText.length > 0
      ? `AND (UM.nome LIKE :searchText OR UM.email LIKE :searchText)`
      : "";
  const parameters = { searchText: `%${searchText}%` };

  const queryCount = `
    SELECT COUNT(UR.id) AS total 
    FROM Users_Roles AS UR INNER JOIN Usuario_Migrar AS UM ON UR.user_id = UM.id
    WHERE UR.role_id = 3 ${searchTextSql}
  `;
  const { rows, totalPages, offset } = await parse_count(
    queryCount,
    parameters,
    currentPage,
    itemsPage
  );

  const query = `
    SELECT
        UR.user_id, UM.nome, UM.email,
        (SELECT UU.phone FROM Usuario_Upgrade AS UU WHERE UU.user_id = UR.user_id) AS phone,
        (SELECT UU.crc FROM Usuario_Upgrade AS UU WHERE UU.user_id = UR.user_id) AS crc,
        UR.updatedAt AS since,
        (SELECT count(EU.id) FROM Empresa_Usuarios as EU WHERE EU.UsuarioId = UR.user_id AND EU.active = 1 AND (EU.accept = 1 OR EU.owner = 1)) as companies,
        (SELECT MAX(UL2.createdAt) FROM Usuario_Log AS UL2 WHERE UR.user_id = UL2.id_usuario) AS lastAccess
    FROM Users_Roles AS UR INNER JOIN Usuario_Migrar AS UM ON UR.user_id = UM.id
    WHERE UR.role_id = 3 ${searchTextSql}
    ORDER BY 2, 3 LIMIT ${offset}, ${itemsPage};
  `;
  const associados = await userController.raw_query(query, parameters);

  const log = parseLog("associados", searchText, rows, currentPage, totalPages);
  await Logger.setSuccessLog(action, log);

  return Handler.Ok({
    status: "success",
    rows,
    current_page: currentPage > totalPages ? 1 : currentPage,
    total_pages: totalPages,
    items: associados,
  });
};

module.exports.getUsuarios = async (event, action) => {
  const itemsPage = rowsByPage;

  const { currentPage, searchText } = parse_queries(event);
  const searchTextSql =
    searchText.length > 0
      ? `WHERE (UM.nome LIKE :searchText OR UM.email LIKE :searchText)`
      : "";
  const parameters = { searchText: `%${searchText}%` };

  const queryCount = `
    SELECT COUNT(id) AS total 
    FROM Usuario_Migrar AS UM 
    ${searchTextSql}
  `;
  const { rows, totalPages, offset } = await parse_count(
    queryCount,
    parameters,
    currentPage,
    itemsPage
  );

  const query = `
    SELECT
      UM.id, UM.nome, UM.email, UM.contador, UM.createdAt,
      (SELECT R.name FROM Roles AS R INNER JOIN Users_Roles AS UR ON R.id = UR.role_id WHERE UR.user_id = UM.id) as profile,
      (SELECT count(EU.id) FROM Empresa_Usuarios as EU WHERE EU.UsuarioId = UM.id AND EU.active = 1 AND (EU.accept = 1 OR EU.owner = 1)) as companies,
      (SELECT MAX(UL2.createdAt) FROM Usuario_Log AS UL2 WHERE UM.id = UL2.id_usuario) AS lastAccess
    FROM Usuario_Migrar AS UM 
    ${searchTextSql}
    ORDER BY 2, 3 LIMIT ${offset}, ${itemsPage};
  `;
  const users = await userController.raw_query(query, parameters);

  const log = parseLog("usuários", searchText, rows, currentPage, totalPages);
  await Logger.setSuccessLog(action, log);

  return Handler.Ok({
    status: "success",
    rows,
    current_page: currentPage > totalPages ? 1 : currentPage,
    total_pages: totalPages,
    items: users,
  });
};

module.exports.getEmpresas = async (event, action) => {
  const itemsPage = rowsByPage;

  const { currentPage, searchText } = parse_queries(event);
  const searchTextSql =
    searchText.length > 0
      ? `WHERE (E.nome LIKE "%${searchText}%" OR E.cnpj LIKE "%${searchText}%" OR E.id = "${searchText}" OR E.cnpj LIKE "%${searchText.replace(
          /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
          "$1.$2.$3/$4-$5"
        )}%")`
      : "";
  const parameters = { searchText: `%${searchText}%` };

  const queryCount = `
    SELECT COUNT(id) AS total 
    FROM  Empresas as E ${searchTextSql}`;
  const { rows, totalPages, offset } = await parse_count(
    queryCount,
    parameters,
    currentPage,
    itemsPage
  );

  const query = `
    SELECT
      E.id, E.nome, E.cnpj, E.active, E.createdAt,
      (SELECT EP.empresa_homologada FROM Empresas_Premium AS EP WHERE EP.company_id = E.id ORDER BY EP.createdAt desc LIMIT 1) AS empresa_homologada,        
      (SELECT count(EU.id) FROM Empresa_Usuarios AS EU WHERE EU.EmpresaId = E.id AND EU.active = 1 AND (EU.accept = 1 OR EU.owner = 1)) AS activeUsers,
      (SELECT MAX(UL2.createdAt) FROM Usuario_Log AS UL2 WHERE UL2.context = E.id) AS lastAccess
    FROM Empresas as E
    ${searchTextSql}
    ORDER BY 2, 3 LIMIT ${offset}, ${itemsPage};
  `;
  const companies = await userController.raw_query(query, parameters);

  const log = parseLog("empresas", searchText, rows, currentPage, totalPages);
  await Logger.setSuccessLog(action, log);

  return Handler.Ok({
    status: "success",
    rows,
    current_page: currentPage > totalPages ? 1 : currentPage,
    total_pages: totalPages,
    items: companies,
  });
};

module.exports.uploadNewFileAssociates = async (event, action) => {
  const body = JSON.parse(event.body);
  const { file } = body;
  const [, contentType, fileEncoded] = file.match(/(data:.+);base64,(.+)/);
  // eslint-disable-next-line new-cap
  const base64Data = new Buffer.from(fileEncoded, "base64");

  const s3 = new AWS.S3({ apiVersion: "2006-03-01", region: "sa-east-1" });

  const extension = mime.extension(contentType.replace("data:", ""));

  const params = {
    Bucket: BUCKET_MATERIAIS_EXCLUSIVOS,
    Key: `${uuidv4().split("-").join("")}.${extension}`,
    Body: base64Data,
    ACL: "public-read",
    ContentEncoding: "base64",
    ContentType: contentType.replace("data:", ""), // required. Notice the back ticks
  };

  let location = null;
  let key = null;
  let errorMessage = null;

  try {
    const { Location, Key } = await s3.upload(params).promise();
    location = Location;
    key = Key;
  } catch (error) {
    console.info(error);
    errorMessage = `${error}`;
  }

  if (!location || !key) {
    return Handler.Error({
      message: errorMessage || "Não foi possível efetuar o upload",
    });
  }

  const { title, description, icon } = body;

  const newFile = {
    key,
    filename: location,
    title,
    description,
    icon,
    contentType: params.ContentType,
  };
  await Materiais_Associados.create(newFile, { raw: true });

  await Logger.setSuccessLog(action, `Novo arquivo postado: ${title}`);

  return Handler.Ok({
    status: "success",
    message: "Upload realizado com sucesso",
    location,
    newFile,
  });
};

module.exports.getFilesAssociates = async (event, action) => {
  const itemsPage = rowsByPage;

  const { currentPage, searchText } = parse_queries(event);
  const searchTextSql =
    searchText.length > 0
      ? `WHERE (MA.title LIKE '%${searchText}%' OR MA.description LIKE '%${searchText}%')`
      : "";
  const parameters = { searchText: `%${searchText}%` };

  const queryCount = `
    SELECT COUNT(MA.id) AS total 
    FROM Materiais_Associados AS MA
    ${searchTextSql}
  `;
  const { rows, totalPages, offset } = await parse_count(
    queryCount,
    parameters,
    currentPage,
    itemsPage
  );

  const query = `
    SELECT *  
    FROM Materiais_Associados AS MA
    ${searchText}
    ORDER BY createdAt DESC  
    LIMIT ${offset}, ${itemsPage};
  `;
  const documents = await userController.raw_query(query, parameters);

  const log = parseLog(
    "materiais associados",
    searchText,
    rows,
    currentPage,
    totalPages
  );
  await Logger.setSuccessLog(action, log);

  return Handler.Ok({
    status: "success",
    rows,
    current_page: currentPage,
    total_pages: totalPages,
    items: documents,
  });
};

module.exports.getEmpresasPremium = async (event, action) => {
  const itemsPage = rowsByPage;

  const { currentPage, searchText } = parse_queries(event);
  const searchTextSql =
    searchText.length > 0
      ? `AND (E.nome LIKE '%${searchText}%' OR E.cnpj LIKE '%${searchText}%')`
      : "";
  const parameters = { searchText: `%${searchText}%` };

  const queryCount = `
    SELECT 
      count(E.id) AS total
    FROM
      Empresas AS E
      INNER JOIN Empresas_Premium AS EP ON (E.id = EP.company_id) AND (EP.data_final_premium > now() OR EP.data_final_premium IS NULL)
      LEFT JOIN Empresas_Premium_Faturamento ON EP.company_id = Empresas_Premium_Faturamento.company_id
    WHERE
      EP.empresa_homologada = 0 ${searchTextSql}
  `;
  const { rows, totalPages, offset } = await parse_count(
    queryCount,
    parameters,
    currentPage,
    itemsPage
  );

  const query = `
    SELECT
      E.id as companyId, E.nome as companyName, E.cnpj as companyCnpj, E.active,
      CONVERT_TZ(EP.data_inicio_premium, '+00:00','-3:00') as data_inicio_premium,
      CONVERT_TZ(EP.data_final_premium, '+00:00','-3:00') as data_final_premium,
      EP.empresa_homologada,
      (SELECT CONVERT_TZ(MAX(UL2.createdAt), '+00:00','-3:00') FROM Usuario_Log AS UL2 WHERE UL2.context = EP.company_id) AS lastAccess,
      (SELECT count(EU.id) FROM Empresa_Usuarios as EU WHERE EU.EmpresaId = EP.company_id AND EU.active = 1 AND (EU.accept = 1 OR EU.owner = 1)) as users,
      EPF.*,
      UM.id AS requestUserId,
      UM.nome AS requestUserName,
      UM.email AS requestUserEmail
    FROM
      Empresas AS E
      INNER JOIN Empresas_Premium AS EP ON (E.id = EP.company_id) AND (EP.data_final_premium > now() OR EP.data_final_premium IS NULL)
      LEFT JOIN Empresas_Premium_Faturamento AS EPF ON EP.company_id = EPF.company_id
      LEFT JOIN Usuario_Migrar AS UM ON EPF.user_id_request = UM.id
    WHERE
      EP.empresa_homologada = 0
      ${searchTextSql}
    ORDER BY 2, 3 LIMIT ${offset}, ${itemsPage};
  `;
  const companies = await userController.raw_query(query, parameters);

  const log = parseLog(
    "empresas premium",
    searchText,
    rows,
    currentPage,
    totalPages
  );
  await Logger.setSuccessLog(action, log);

  return Handler.Ok({
    status: "success",
    rows,
    current_page: currentPage > totalPages ? 1 : currentPage,
    total_pages: totalPages,
    items: companies,
  });
};

module.exports.getReportPremium = async (event, action) => {
  const query = `
  SELECT 
    E.id as companyId, E.nome as companyName, E.cnpj as companyCnpj, E.active,
    CONVERT_TZ(EP.data_inicio_premium, '+00:00','-3:00') as data_inicio_premium,
    CONVERT_TZ(EP.data_final_premium, '+00:00','-3:00') as data_final_premium,
    EP.empresa_homologada,
    (SELECT CONVERT_TZ(MAX(UL2.createdAt), '+00:00','-3:00') FROM Usuario_Log AS UL2 WHERE UL2.context = EP.company_id) AS lastAccess,
    (SELECT count(EU.id) FROM Empresa_Usuarios as EU WHERE EU.EmpresaId = EP.company_id AND EU.active = 1 AND (EU.accept = 1 OR EU.owner = 1)) as users,
    EPF.*,
    UM.id AS requestUserId,
    UM.nome AS requestUserName,
    UM.email AS requestUserEmail
  FROM
    Empresas AS E
    INNER JOIN Empresas_Premium AS EP ON (E.id = EP.company_id) AND (EP.data_final_premium > now() OR EP.data_final_premium IS NULL)
    LEFT JOIN Empresas_Premium_Faturamento AS EPF ON EP.company_id = EPF.company_id
    LEFT JOIN Usuario_Migrar AS UM ON EPF.user_id_request = UM.id
  WHERE
    EP.empresa_homologada = 0
  ORDER BY 2, 3
  `;
  const companies = await userController.raw_query(query);

  if (companies.length === 0) {
    return Handler.Ok({
      status: "premium_companies_empty_report",
      message: "Nenhuma empresa premium encontrada.",
    });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Simbiose @ Omie";
  workbook.company = "Omiexperience S.A.";
  const sheet = workbook.addWorksheet("Empresas Premium");

  sheet.columns = [
    { header: "ID", key: "companyId", width: 42 },
    { header: "CNPJ / Aplicativo", key: "companyCnpj", width: 22 },
    { header: "Empresa / Aplicativo", key: "companyName", width: 45 },
    { header: "Data Ativação", key: "createdAt", width: 22 },
    { header: "Tipo Faturamento", key: "entidade_faturamento", width: 18 },
    { header: "CPF", key: "cpf", width: 22 },
    { header: "Nome", key: "nome", width: 45 },
    { header: "CNPJ", key: "cnpj", width: 22 },
    { header: "Nome Fantasia", key: "nome_fantasia", width: 45 },
    { header: "Razão Social", key: "razao_social", width: 45 },
    { header: "Telefone", key: "telefone", width: 20 },
    { header: "CEP", key: "endereco_cep", width: 15 },
    { header: "Endereço", key: "endereco_logradouro", width: 50 },
    { header: "Número", key: "endereco_numero", width: 15 },
    { header: "Complemento", key: "endereco_complemento", width: 30 },
    { header: "Bairro", key: "endereco_bairro", width: 40 },
    { header: "Cidade", key: "endereco_cidade", width: 40 },
    { header: "Estado", key: "endereco_estado", width: 20 },
    { header: "Contato Financeiro", key: "financeiro_contato", width: 45 },
    {
      header: "Telefone/Celular",
      key: "financeiro_contato_celular",
      width: 20,
    },
    { header: "E-mail", key: "financeiro_contato_email", width: 40 },
    { header: "Usuário Requisitante", key: "requestUserName", width: 45 },
    {
      header: "Usuário Requisitante E-mail",
      key: "requestUserEmail",
      width: 40,
    },
  ];

  companies.forEach((company) => {
    const payload = {};
    for (let i = 0; i < sheet.columns.length; i++) {
      const column = sheet.columns[i].key;
      payload[column] = company[column];
    }
    sheet.addRow(payload);
  });

  const extension = "xlsx";
  const s3 = new AWS.S3({ apiVersion: "2006-03-01", region: "sa-east-1" });
  const stream = new Stream.PassThrough();

  await workbook.xlsx.write(stream);

  const params = {
    Bucket: BUCKET_MATERIAIS_EXCLUSIVOS,
    Key: `${uuidv4().split("-").join("")}.${extension}`,
    Body: stream,
    ACL: "public-read",
    ContentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };

  const { Key } = await s3.upload(params).promise();

  const params_download = {
    Bucket: BUCKET_MATERIAIS_EXCLUSIVOS,
    Key,
    Expires: 60,
  };
  const url = await s3.getSignedUrlPromise("getObject", params_download);

  await Logger.setSuccessLog(action, `Gerado relatório de empresas premium.`);

  return Handler.Ok({
    status: "success",
    url,
    extension,
  });
};

module.exports.getLogs = async (event, action) => {
  const { dateStart, dateFinish, user, company } = event.queryStringParameters;
  const actionFilter = event.queryStringParameters.action;

  const filterUser = user !== "ALL" ? `AND Usuario_Log.id_usuario = :user` : "";
  const filterCompany =
    company !== "ALL" ? `AND Usuario_Log.context = :company` : "";
  const filterAction =
    actionFilter !== "ALL" ? `AND Usuario_Log.action = :action` : "";

  const query = `
  SELECT 
      CONVERT_TZ(Usuario_Log.createdAt, '+00:00','-3:00') as createdAt,
      Usuario_Log.id as logId, 
      Usuario_Migrar.nome as user, 
      Usuario_Migrar.id as userId, 
      Usuario_Log.action, 
      Usuario_Log.status, 
      Usuario_Log.log, 
      Empresas.nome as company, 
      Empresas.id as companyId
  FROM 
      Usuario_Log 
      INNER JOIN Usuario_Migrar on Usuario_Log.id_usuario = Usuario_Migrar.id 
      LEFT JOIN Empresas on Usuario_Log.context = Empresas.id   
  WHERE 
      CONVERT_TZ(Usuario_Log.createdAt, '+00:00','-3:00') >= DATE(:dateStart)
      AND CONVERT_TZ(Usuario_Log.createdAt, '+00:00','-3:00') <= DATE_ADD(DATE(:dateFinish), interval 1 DAY)
      ${filterUser}
      ${filterCompany}
      ${filterAction}
  ORDER BY
      1 DESC, Usuario_Log.id desc`;
  const rows = await userController.raw_query(query, {
    dateStart,
    dateFinish,
    user,
    company,
    action: actionFilter,
  });

  const users = [];
  const actions = [];
  const companies = [];
  const status = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    users.push({
      userId: row.userId,
      user: row.user,
    });
    actions.push(row.action);
    status.push(row.status);
    companies.push({
      company: row.company,
      companyId: row.companyId,
    });
  }

  const usersClean = users.filter(
    (value, index, self) =>
      index ===
      self.findIndex((t) => t.userId === value.userId && t.user === value.user)
  );
  usersClean.sort((a, b) => {
    const textA = a.user.toUpperCase();
    const textB = b.user.toUpperCase();
    // eslint-disable-next-line no-nested-ternary
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });

  const companiesClean = companies.filter(
    (value, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          value.company !== null &&
          t.company === value.company &&
          t.companyId === value.companyId
      )
  );
  companiesClean.sort((a, b) => {
    const textA = a.company.toUpperCase();
    const textB = b.company.toUpperCase();
    // eslint-disable-next-line no-nested-ternary
    return textA < textB ? -1 : textA > textB ? 1 : 0;
  });

  const actionsClean = [...new Set(actions)].sort();
  const statusClean = [...new Set(status)].sort();

  await Logger.setSuccessLog(action, `Carregando logs de [${dateStart}]`);

  return Handler.Ok({
    status: "success",
    total_items: rows.length,
    items: rows,
    users: usersClean,
    companies: companiesClean,
    actions: actionsClean,
    statusLogs: statusClean,
  });
};
