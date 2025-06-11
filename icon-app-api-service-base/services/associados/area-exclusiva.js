const AWS = require("aws-sdk");
const mime = require("mime-types");
const Handler = require("../handler");
const Logger = require("../../auth/logService");
const userController = require("../../auth/userController");
const models = require("../../models");

const { Materiais_Associados } = models;

const parse_queries = (event) => {
  let currentPage = 1;
  let searchText = "";

  if (event.queryStringParameters) {
    let { page, q } = event.queryStringParameters;
    try {
      page = parseInt(page, 10);
      if (!Number.isInteger(page)) {
        page = 1;
      }
    } catch (e) {
      page = 1;
    }
    currentPage = page > 1 ? page : 1;
    searchText = q ? (q.length > 0 ? q : "") : "";
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
    rows > 0 ? (currentPage > totalPages ? 1 : currentPage) : 0
  }] de [${totalPages}]`;

  return log;
};

module.exports.getFilesAssociates = async (event, action) => {
  try {
    const itemsPage = 25;

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
        SELECT MA.id, MA.title, MA.description, MA.downloads, MA.contentType, MA.createdAt
        FROM Materiais_Associados AS MA
        ${searchTextSql}
        ORDER BY createdAt DESC  
        LIMIT ${offset}, ${itemsPage};
    `;
    const items = await userController.raw_query(query, parameters);

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
      current_page: currentPage > totalPages ? 1 : currentPage,
      total_pages: totalPages,
      items,
    });
  } catch (error) {
    return Handler.Exception(action, error);
  }
};

module.exports.getDemoCompany = async (event, action) => {
  try {
    const demos = await userController.raw_query(
      "SELECT * FROM Empresas WHERE demo = 1"
    );

    return Handler.Ok({
      status: "success",
      demos,
    });
  } catch (error) {
    return Handler.Exception(action, error);
  }
};

module.exports.downloadFile = async (event, action) => {
  try {
    const { fileId } = event.pathParameters;

    const filter = {
      where: {
        id: fileId,
      },
      raw: true,
    };
    const material = await Materiais_Associados.findOne(filter);

    if (!material) {
      await Logger.setLog(
        action,
        "not_found",
        `Tentativa de Download de Material Exlusivo - id: ${fileId}`
      );
      return Handler.NotFound({
        message: "Material solicitado não existe",
      });
    }

    const { BUCKET_MATERIAIS_EXCLUSIVOS } = process.env;

    const s3 = new AWS.S3();
    const params = {
      Bucket: BUCKET_MATERIAIS_EXCLUSIVOS,
      Key: material.key,
      Expires: 60,
    };
    const url = await s3.getSignedUrlPromise("getObject", params);

    const extension = mime.extension(material.contentType.replace("data:", ""));

    await userController.raw_query(
      `UPDATE Materiais_Associados SET downloads = downloads + 1 WHERE id = :fileId;`,
      { fileId }
    );
    await Logger.setSuccessLog(
      action,
      `Download de Material Exlusivo - id: ${fileId}`
    );

    return Handler.Ok({
      url,
      extension,
    });
  } catch (error) {
    return Handler.Exception(action, error);
  }
};
