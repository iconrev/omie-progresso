/* eslint-disable no-continue */
/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
const fs = require("fs").promises;
const Stream = require("stream");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const AWS = require("aws-sdk");
const Handler = require("../handler");
const Setup = require("../data/setup");
const Logger = require("../../auth/logService");
const userController = require("../../auth/userController");
const { loadTemplate } = require("../generico/EmailTemplate");
const telegram = require("../../auth/telegramService");
const Mail = require("../../auth/mailService");
const raw = require("../rawquery");
const CnpjService = require("../generico/CnpjService");
const models = require("../../models");
const { WorkbookDre } = require("../classes/WorkbookDre");
const { WorkbookDiagnostico } = require("../classes/WorkbookDiagnostico");

const { Empresas } = models;
const { Empresa_Exercicios } = models;
const { Usuario_Migrar } = models;
const { Usuario_Convites } = models;
const { Empresa_Responsaveis } = models;
const { Empresa_Usuarios } = models;
const { Empresas_Premium } = models;
const { Roles_Company } = models;
const { Empresas_Premium_Faturamento } = models;
const { Dre, Dre_Despesas } = models;
const { Clientes, Fornecedores, Concorrentes } = models;
const { Vendas, Processos, Pessoas } = models;

const insertYearCompany = async (companyId, year, action) => {
  const query = {
    EmpresaId: companyId,
    ano: year,
  };
  await Empresa_Exercicios.create(query)
    .then(async () => {
      await Logger.setSuccessLog(
        action,
        `Exercício [${year}] criado com sucesso`
      );
    })
    .catch((err) => {
      console.error("Erro ao criar exercício:", err);
    });

  await Setup.setup(companyId, year);
};

const getYearsByCompany = async (companyId, event) => {
  const query = {
    attributes: ["id", "ano"],
    where: {
      EmpresaId: companyId,
    },
    order: [["ano", "ASC"]],
    raw: true,
  };
  const years = await Empresa_Exercicios.findAll(query);
  const yearCurrent = new Date().getFullYear();

  if (years.length === 0) {
    await insertYearCompany(companyId, yearCurrent, event);
    return getYearsByCompany(companyId, event);
  }

  for (let i = 0; i < years.length; i++) {
    const year = years[i].ano;
    const nextYear = year + 1;
    years[i].current = !!(year === yearCurrent);
    if (nextYear > yearCurrent) continue;
    if (!years.find((element) => element.ano === nextYear)) {
      // eslint-disable-next-line no-await-in-loop
      await insertYearCompany(companyId, nextYear, event);
      return getYearsByCompany(companyId, event);
    }
  }

  // adiciona o próximo ano a partir de outubro
  const october = new Date(`${yearCurrent}-10-01`);
  if (october < new Date()) {
    const nextYearCurrent = yearCurrent + 1;
    if (!years.find((element) => element.ano === nextYearCurrent)) {
      await insertYearCompany(companyId, nextYearCurrent, event);
      return getYearsByCompany(companyId, event);
    }
  }

  const yearSorter = (a, b) => {
    if (b.ano > a.ano) return 1;
    if (a.ano > b.ano) return -1;
    return 0;
  };

  years.sort(yearSorter);

  return years;
};

const composeEmailInviteCompany = async (mailData) => {
  const { convite, host } = mailData;

  const preview = process.env.NODE_ENV === "dev" ? "-preview" : "";
  const link = `https://simbiose${preview}.omie.com.br/#/login`;

  const body = await loadTemplate("ConviteEmpresa", {
    url_host: link,
    convidado: convite.nome,
    host: host.nome,
    company: convite.empresa,
  });

  const subject = `Omie Simbiose - Convite`;

  return {
    to: convite.email,
    subject,
    body,
  };
};

const saveInvite = async (mailData) => {
  let response = false;

  const { convite, host } = mailData;

  const filterInvite = {
    where: {
      email: convite.email,
      EmpresaId: convite.empresaId,
    },
  };
  await Usuario_Convites.findOne(filterInvite)
    .then(async (result) => {
      if (result) {
        response = {
          status: "success",
          message: `Convite foi reenviado para ${convite.nome} (${convite.email}) com sucesso.`,
          log: `Convite reenviado para: ${convite.nome}`,
        };
      } else {
        const conviteData = {
          nome: convite.nome,
          email: convite.email,
          EmpresaId: convite.empresaId,
          UsuarioId: host.cognito_id,
          nomeEmpresa: convite.empresa,
          cargo: convite.cargo,
          role_company_id: convite.role_company_id,
          aceito: false,
        };
        await Usuario_Convites.create(conviteData, { raw: true }).then(
          (resultCreate) => {
            response = {
              status: "success",
              message: `Convite enviado para ${convite.nome} (${convite.email}) com sucesso.`,
              log: `Novo usuário convidado: ${convite.nome}`,
              id: resultCreate.id,
            };
          }
        );
      }
    })
    .catch((err) => {
      console.error(err);
      response = {
        status: "fatal_error",
        message: `Não foi possível enviar o Convite para ${convite.nome} (${convite.email}) nesse momento :(`,
      };
    });

  return response;
};

const validarEmpresaUsuario = async (cnpj, user) => {
  let response = true;

  const filter = {
    attributes: [["id", "empresa"]],
    include: [
      {
        model: Usuario_Migrar,
        as: "users",
        required: true,
        attributes: [["id", "usuario"]],
        through: {
          attributes: ["id"],
        },
        where: {
          id: user,
        },
      },
    ],
    where: {
      cnpj,
    },
    raw: true,
  };
  await Empresas.findAll(filter)
    .then((result) => {
      response = result.length > 0;
    })
    .catch((error) => {
      console.error(error);
    });

  return response;
};

const validarEmpresaAssociado = async (cnpj, companyId) => {
  const filter = {
    where: {
      EmpresaId: companyId,
      owner: 1,
    },
    raw: true,
  };
  const user = await Empresa_Usuarios.findOne(filter);

  return validarEmpresaUsuario(cnpj, user.UsuarioId);
};

const uuidGenerate = (clean = true) => {
  const value = uuidv4();
  return clean ? value.replace(/-/g, "") : value;
  // if (clean) {
  //   value = uuidv4().split("-").join("");
  // }
  // return value;
};

const deleteInvite = async (email, companyId, event, action) => {
  let response = false;

  const data = {
    where: {
      email,
      EmpresaId: companyId,
    },
  };
  await Usuario_Convites.destroy(data)
    .then(async () => {
      await Logger.setLog(
        action,
        "success",
        `Convite para [${email}] removido com sucesso.`
      );
      response = true;
    })
    .catch(async (err) => {
      console.error(err);
      await Logger.setLog(
        action,
        "fatal_error",
        `Erro ao excluir convite: ${err}`
      );
    });

  return response;
};

const activeTrial = async (companyId) => {
  const data_inicio_premium = new Date();
  const data_final_premium = new Date(data_inicio_premium.getTime());
  data_final_premium.setDate(data_inicio_premium.getDate() + 30);
  data_final_premium.setHours(23, 59, 59);

  const dataPremium = {
    company_id: companyId,
    data_inicio_premium,
    data_final_premium,
    empresa_homologada: 2,
  };
  await Empresas_Premium.create(dataPremium);

  return dataPremium;
};

const hasTrialAvailable = async (companyId) => {
  const filter = {
    where: {
      company_id: companyId,
    },
    raw: true,
  };
  const trial = await Empresas_Premium.findAll(filter);

  return !!(trial.length === 0);
};

const findResponsibleByEmail = async (companyId, email) => {
  const query = `
    SELECT *
    FROM Empresa_Responsaveis
    WHERE EmpresaId = '${companyId}' AND Email = '${email}';
  `;
  const response = await raw.query(query);
  return response.length > 0 ? response[0] : null;
};

const hasTrialActive = async (companyId) => {
  const query = `
  SELECT * FROM Empresas_Premium
  WHERE 
      company_id = :company_id
      AND empresa_homologada = 2
      AND (
          data_final_premium is NULL 
          OR data_final_premium >= Date(CONVERT_TZ(current_timestamp(), '+00:00','-3:00'))
      )
`;
  const companyTrial = await userController.raw_query(query, {
    company_id: companyId,
  });
  return !!(companyTrial.length > 0);
};

const hasPremiumActive = async (companyId) => {
  const query = `
    SELECT * FROM Empresas_Premium
    WHERE 
        company_id = :company_id
        AND empresa_homologada != 2
        AND (
            data_final_premium is NULL 
            OR data_final_premium >= current_timestamp()
        )
  `;
  const companyPremium = await userController.raw_query(query, {
    company_id: companyId,
  });
  return !!(companyPremium.length > 0);
};

const activePremium = async (company, user) => {
  const hasTrial = await hasTrialActive(company.id);
  if (hasTrial) {
    const query = `
      UPDATE Empresas_Premium
      SET data_final_premium = current_timestamp()
      WHERE 
          company_id = :company_id
          AND empresa_homologada = 2
          AND (
              data_final_premium is NULL 
              OR data_final_premium >= Date(CONVERT_TZ(current_timestamp(), '+00:00','-3:00'))
          )    
    `;
    await userController.raw_query(query, { company_id: company.id });
  }

  const dataPremium = {
    company_id: company.id,
    data_inicio_premium: new Date(),
    data_final_premium: null,
    empresa_homologada: 0,
  };
  await Empresas_Premium.create(dataPremium);

  const queryEmail = `
    SELECT 
        Usuario_Migrar.email
    FROM Empresa_Usuarios INNER JOIN Usuario_Migrar ON Empresa_Usuarios.UsuarioId = Usuario_Migrar.id
    WHERE Empresa_Usuarios.EmpresaId = :company_id
    GROUP BY 1
  `;
  const sendTo = await userController.raw_query(queryEmail, {
    company_id: company.id,
  });

  if (sendTo.length > 0) {
    const preview = process.env.NODE_ENV === "prod" ? "" : "-preview";
    const body = await loadTemplate("UpgradePremium", {
      api_stage: `https://api.simbiose${preview}.omie.com.br/service-base`,
      utm_campaign: "upgrade-premium",
      utm_id: uuidGenerate(false),
      utm_term: `admin-upgrade-premium`,
      utm_content: company.id,
      company_name: company.nome,
      company_cnpj: company.cnpj,
      user_name: user.nome,
      user_email: user.email,
    });
    const emailCompose = {
      to: sendTo.map((item) => item.email),
      subject: "Bem-vindo ao Premium",
      body,
    };
    await Mail.sendMail(emailCompose);
  }

  return dataPremium;
};

const saveDreFromSheet = async (dataFromFile, companyId, action) => {
  const dres = dataFromFile.dre.length;
  for (let i = 0; i < dres; i++) {
    const dre = dataFromFile.dre[i];
    const filterDre = {
      where: {
        EmpresaId: companyId,
        ano_exercicio: dre.ano_exercicio,
      },
      raw: true,
    };
    const resultDre = await Dre.findOne(filterDre);
    let dreId;
    if (resultDre) {
      await Dre.update(dre, filterDre);
      dreId = resultDre.id;
    } else {
      const dreCreated = await Dre.create({
        ...dre,
        EmpresaId: companyId,
      });
      dreId = dreCreated.id;
    }

    await Dre_Despesas.destroy({
      where: {
        dre_id: dreId,
      },
    });

    const items = dre.despesas;
    const promisesArray = [];
    for (const item of items) {
      const payload = {
        value: item.value,
        key: item.key,
        description: item.label,
        dre_id: dreId,
        editable: !(item.label === "Pessoal"),
      };
      promisesArray.push(Dre_Despesas.create(payload));
    }
    await Promise.all(promisesArray);
  }

  const logInfo = `Dados [DRE] de atualizados com sucesso via planilha`;
  await Logger.setSuccessLog(action, logInfo);
};

const saveFornecedoresFromSheet = async (dataFromFile, companyId, action) => {
  const data = dataFromFile.fornecedores;
  const year = dataFromFile.dre[0].ano_exercicio;

  if (!year) {
    const logInfo = `Dados [Fornecedores] não foram atualizados`;
    await Logger.setSuccessLog(action, logInfo);
    return;
  }

  const filter = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: year + 1,
    },
    raw: true,
  };
  await Fornecedores.destroy(filter);

  await Promise.all(
    data.map((item) =>
      Fornecedores.create({
        EmpresaId: companyId,
        ano_exercicio: year + 1,
        fornecedor: item,
      })
    )
  );

  const logInfo = `Dados [Fornecedores] de atualizados com sucesso via planilha`;
  await Logger.setSuccessLog(action, logInfo);
};

const saveConcorrentesFromSheet = async (dataFromFile, companyId, action) => {
  const data = dataFromFile.concorrentes;
  const year = dataFromFile.dre[0].ano_exercicio;

  if (!year) {
    const logInfo = `Dados [Concorrentes] não foram atualizados`;
    await Logger.setSuccessLog(action, logInfo);
    return;
  }

  const filter = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: year + 1,
    },
    raw: true,
  };
  await Concorrentes.destroy(filter);

  await Promise.all(
    data.map((item) =>
      Concorrentes.create({
        EmpresaId: companyId,
        ano_exercicio: year + 1,
        concorrente: item,
      })
    )
  );

  const logInfo = `Dados [Concorrentes] de atualizados com sucesso via planilha`;
  await Logger.setSuccessLog(action, logInfo);
};

const saveClientesFromSheet = async (dataFromFile, companyId, action) => {
  const data = dataFromFile.clientes;
  const year = dataFromFile.dre[0].ano_exercicio;

  if (!year) {
    const logInfo = `Dados [Clientes] não foram atualizados`;
    await Logger.setSuccessLog(action, logInfo);
    return;
  }

  const filter = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: year + 1,
    },
    raw: true,
  };
  await Clientes.destroy(filter);

  await Promise.all(
    data.map((item) =>
      Clientes.create({
        EmpresaId: companyId,
        ano_exercicio: year + 1,
        cliente: item,
      })
    )
  );

  const logInfo = `Dados [Clientes] de atualizados com sucesso via planilha`;
  await Logger.setSuccessLog(action, logInfo);
};

const saveComercialFromSheet = async (dataFromFile, companyId, action) => {
  const diagnosticos = dataFromFile.diagnostico.length;
  for (let i = 0; i < diagnosticos; i++) {
    const diagnostico = dataFromFile.diagnostico[i];
    const filter = {
      where: {
        EmpresaId: companyId,
        ano_exercicio: diagnostico.ano_exercicio,
      },
      raw: true,
    };
    const result = await Vendas.findOne(filter);

    if (result) {
      await Vendas.update(diagnostico, filter);
    } else {
      await Vendas.create({
        ...diagnostico,
        EmpresaId: companyId,
      });
    }
  }

  const logInfo = `Dados [Comercial] de atualizados com sucesso via planilha`;
  await Logger.setSuccessLog(action, logInfo);
};

const saveProcessosFromSheet = async (dataFromFile, companyId, action) => {
  const diagnosticos = dataFromFile.diagnostico.length;
  for (let i = 0; i < diagnosticos; i++) {
    const diagnostico = dataFromFile.diagnostico[i];
    const filter = {
      where: {
        EmpresaId: companyId,
        ano_exercicio: diagnostico.ano_exercicio,
      },
      raw: true,
    };
    const result = await Processos.findOne(filter);

    if (result) {
      await Processos.update(diagnostico, filter);
    } else {
      await Processos.create({
        ...diagnostico,
        EmpresaId: companyId,
      });
    }
  }

  const logInfo = `Dados [Comercial] de atualizados com sucesso via planilha`;
  await Logger.setSuccessLog(action, logInfo);
};

const savePessoasFromSheet = async (dataFromFile, companyId, action) => {
  const diagnosticos = dataFromFile.diagnostico.length;
  for (let i = 0; i < diagnosticos; i++) {
    const diagnostico = dataFromFile.diagnostico[i];
    const filter = {
      where: {
        EmpresaId: companyId,
        ano_exercicio: diagnostico.ano_exercicio,
      },
      raw: true,
    };
    const result = await Pessoas.findOne(filter);

    if (result) {
      await Pessoas.update(diagnostico, filter);
    } else {
      await Pessoas.create({
        ...diagnostico,
        EmpresaId: companyId,
      });
    }
  }

  const logInfo = `Dados [Comercial] de atualizados com sucesso via planilha`;
  await Logger.setSuccessLog(action, logInfo);
};

module.exports.getUsersInCompany = async (event, action) => {
  const { companyId } = action;

  const queryInvited = `
    SELECT 
        Usuario_Convites.id, Usuario_Convites.nome,
        Usuario_Convites.email, Usuario_Convites.cargo,
        Roles_Company.NAME as role_company, Usuario_Convites.createdAt
    FROM Usuario_Convites
        LEFT JOIN Roles_Company ON Usuario_Convites.role_company_id = Roles_Company.id
    WHERE
        Usuario_Convites.EmpresaId = :companyId
    ORDER BY 2    
  `;
  const invitedPromise = userController.raw_query(queryInvited, {
    companyId,
  });

  const queryGuests = `
    SELECT 
        EU.EmpresaId, EU.UsuarioId as user_id,
        UM.nome, UM.email, EU.cargo, RC.NAME as role_company,  
        EU.accept, EU.active, EU.invitedAt, EU.acceptAt,
        (
            SELECT CONVERT_TZ(MAX(UL2.createdAt), '+00:00','-3:00') 
            FROM Usuario_Log AS UL2 
            WHERE EU.UsuarioId = UL2.id_usuario AND UL2.context = :companyId
        ) AS lastAccess
    FROM 
        Empresa_Usuarios AS EU 
        INNER JOIN Usuario_Migrar AS UM ON EU.UsuarioId = UM.id
        LEFT JOIN Users_Roles_Company AS URC ON UM.id = URC.user_id AND EU.EmpresaId = URC.company_id
        LEFT JOIN Roles_Company AS RC ON URC.role_company_id = RC.id
    WHERE 
        EU.EmpresaId = :companyId
    ORDER BY 3
  `;
  const acceptedPromise = userController.raw_query(queryGuests, {
    companyId,
  });

  const queryResposible = `
    SELECT Empresa_Responsaveis.id,
        Empresa_Responsaveis.nome, Empresa_Responsaveis.email, Empresa_Responsaveis.cargo,
        (SELECT Roles_Company.name FROM Roles_Company WHERE id = 5) as role_company,
        Empresa_Responsaveis.active, Empresa_Responsaveis.createdAt
    FROM Empresa_Responsaveis
    WHERE Empresa_Responsaveis.EmpresaId = :companyId
    ORDER BY 2    
  `;
  const responsiblePromise = userController.raw_query(queryResposible, {
    companyId,
  });

  const [invited, accepted, responsible] = await Promise.all([
    invitedPromise,
    acceptedPromise,
    responsiblePromise,
  ]);

  const responsibleClean = [];
  for (const row of responsible) {
    if (invited.findIndex((item) => item.email === row.email) > -1) continue;
    if (accepted.findIndex((item) => item.email === row.email) > -1) continue;

    responsibleClean.push(row);
  }

  await Logger.setSuccessLog(action, `Carregando usuários`);

  return Handler.Ok({
    invited,
    accepted,
    responsible: responsibleClean,
  });
};

module.exports.createNewUserInCompany = async (event, action) => {
  const { companyId, user } = action;

  const body = JSON.parse(event.body);
  const { name, email, job, role } = body;

  // -------------------- validação inicio
  const permissionsUser = await userController.getPermissionsCompanyByUser(
    companyId,
    user.id
  );
  const onlyPermission = ["acesso_company_config"];

  if (
    permissionsUser.filter((permission) =>
      onlyPermission.includes(permission.permission)
    ).length === 0
  ) {
    return Handler.Unauthorized(action);
  }

  const rolesUser = await userController.getRolesCompanyByUser(
    companyId,
    user.id
  );
  const onlyRole = ["company_admin", "associado", "associado_nivel_2"];

  if (
    rolesUser.filter((roleUser) => onlyRole.includes(roleUser.role)).length ===
    0
  ) {
    return Handler.Unauthorized(action);
  }

  if (rolesUser.length === 1) {
    if (
      rolesUser.filter((roleUser) => roleUser.role === "associado_nivel_2")
        .length > 0
    ) {
      const companyIsHomologada = await userController.companyIsHomologada(
        companyId
      );
      if (companyIsHomologada) return Handler.Unauthorized(action);
    }
  }
  // -------------------- validação termino

  if (user.email === email) {
    await Logger.setLog(
      action,
      "bad_request",
      `Convite não poderá ser enviado para o próprio usuário.`
    );
    return Handler.BadRequest({
      message: "Convite não poderá ser enviado para o próprio usuário.",
    });
  }

  const empresa = await Empresas.findOne({
    where: { id: companyId },
    raw: true,
  });

  let message;
  let log;
  let status;

  const isResposible = await findResponsibleByEmail(companyId, email);
  if (!isResposible) {
    const responsavel = {
      EmpresaId: companyId,
      nome: name,
      email,
      cargo: job,
      active: true,
    };
    await Empresa_Responsaveis.create(responsavel, { raw: true })
      .then(() => {
        status = "success";
        message = "Responsável salvo com sucesso :)";
        log = `Novo responsável cadastrado [${responsavel.nome}]`;
      })
      .catch((err) => {
        status = "fatal_error";
        message =
          "Ocorreu um problema ao salvar o responsável. Tente novamente.";
        log = `Erro ao salvar o responsável na empresa [${companyId}]: ${err}`;
      });
  }

  const filterInvite = {
    where: {
      email,
      EmpresaId: companyId,
    },
    raw: true,
  };
  let hasInvite = await Usuario_Convites.findAll(filterInvite);
  hasInvite = hasInvite.length > 0 ? hasInvite[0] : null;
  if (hasInvite) {
    await Logger.setLog(
      action,
      "bad_request",
      `O usuário já foi convidado para outra função.`
    );
    return Handler.BadRequest({
      message: "O usuário já foi convidado para outra função.",
    });
  }

  const isVinculed = await userController.findUserInCompanyByEmail(
    companyId,
    email
  );
  if (isVinculed) {
    await Logger.setLog(
      action,
      "bad_request",
      `O Convite não pode ser enviado pois o convidado já possui acesso para esta empresa.`
    );
    return Handler.BadRequest({
      message:
        "O Convite não pode ser enviado pois o convidado já possui acesso para esta empresa.",
    });
  }

  const permissionsRole =
    await userController.getPermissionsCompanyByRoleCompany(role);
  if (permissionsRole.length > 0) {
    const role_company = await Roles_Company.findOne({
      where: { name: role },
      raw: true,
    });

    const mailData = {
      convite: {
        empresa: empresa.nome, // Empresa_Usuario (empresa do owner)
        empresaId: empresa.id, // código da empresa
        nome: name, // dinamico
        email, // dinamico
        cargo: job, // dinamico
        role_company_id: role_company.id,
      },
      host: user,
    };

    const statusSave = await saveInvite(mailData);
    if (statusSave.status !== "success") {
      return Handler.Error(statusSave);
    }

    status = "success";
    message = statusSave.message;
    log = statusSave.log;

    const emailCompose = await composeEmailInviteCompany(mailData);
    const statusSendMail = await Mail.sendMail(emailCompose);
    if (!statusSendMail) {
      status = "warning";
      message = `O usuário foi cadastrado mas não foi possível enviar o e-mail para ${mailData.convite.nome} (${mailData.convite.email})`;
      log = message;
    }
  } else if (isResposible) {
    await Logger.setLog(
      action,
      "bad_request",
      `O usuário já está cadastrado na empresa.`
    );
    return Handler.BadRequest({
      message: "O usuário já está cadastrado na empresa.",
    });
  }

  await Logger.setLog(action, status, log);

  return Handler.Ok({
    status: "success",
    message,
  });
};

module.exports.removeUserInCompany = async (event, action) => {
  const { companyId, user } = action;

  // -------------------- validação inicio
  const permissionsUser = await userController.getPermissionsCompanyByUser(
    companyId,
    user.id
  );
  const onlyPermission = ["acesso_company_config"];

  if (
    permissionsUser.filter((permission) =>
      onlyPermission.includes(permission.permission)
    ).length === 0
  ) {
    return Handler.Unauthorized(action);
  }

  const rolesUser = await userController.getRolesCompanyByUser(
    companyId,
    user.id
  );
  const onlyRole = ["company_admin", "associado", "associado_nivel_2"];

  if (rolesUser.filter((role) => onlyRole.includes(role.role)).length === 0) {
    return Handler.Unauthorized(action);
  }

  if (rolesUser.length === 1) {
    if (
      rolesUser.filter((role) => role.role === "associado_nivel_2").length > 0
    ) {
      const companyIsHomologada = await userController.companyIsHomologada(
        companyId
      );
      if (companyIsHomologada) return Handler.Unauthorized(action);
    }
  }
  // -------------------- validação termino

  const body = JSON.parse(event.body);
  const { email } = body;
  let responsavel;
  let userGuest;
  let hasTasks;

  if (email === user.email) {
    return Handler.BadRequest({
      message:
        "O usuário não pode ser removido da empresa pois é o próprio usuário.",
    });
  }

  const hasResponsavel = await userController.raw_query(
    `
    SELECT 
        ER.id, ER.email, ER.active,
        (
        SELECT count(DTR.id)
            FROM Diretrizes_Tarefas_Responsaveis DTR
            WHERE DTR.responsavel_id = ER.id 
        ) as tasks
    FROM Empresa_Responsaveis ER
    WHERE ER.EmpresaId = :companyId AND ER.email = :email
  `,
    { companyId, email }
  );
  if (hasResponsavel.length > 0) {
    [responsavel] = hasResponsavel;
    hasTasks = responsavel.tasks > 0;
  }

  const companyHasUser = await userController.raw_query(
    `
    SELECT EU.*, Usuario_Migrar.nome
    FROM Empresa_Usuarios EU INNER JOIN Usuario_Migrar ON EU.UsuarioId = Usuario_Migrar.id
    WHERE EU.EmpresaId = :companyId  AND Usuario_Migrar.email = :email    
    `,
    { companyId, email }
  );
  if (companyHasUser.length > 0) [userGuest] = companyHasUser;

  let message;
  let status;

  if (responsavel && hasTasks) {
    if (responsavel.active === 1) {
      await userController.updateStatusResponsibleCompany(
        responsavel.email,
        companyId,
        0,
        event,
        action
      );
      message =
        "Existem tarefas associadas ao usuário. O mesmo foi inativado apenas";
    } else {
      message =
        "Existem tarefas associadas ao usuário. O usuário não pode ser excluído";
    }
    status = "user_has_tasks";
  } else if (responsavel && !hasTasks) {
    const filter = {
      where: {
        id: responsavel.id,
      },
    };
    await Empresa_Responsaveis.destroy(filter);
    status = "success";
    message = "O usuário foi removido com sucesso";
  }

  if (userGuest) {
    await userController.removeAccessUserFromCompany(
      userGuest.UsuarioId,
      companyId,
      event,
      action,
      userGuest.nome
    );
    if (hasTasks) {
      message =
        "O usuário não possui mais acesso a sua empresa porém existem tarefas associadas ao seu perfil. O usuário será mantido como inativo";
      status = "user_has_tasks";
    } else {
      message = "Usuário removido com sucesso";
      status = "success";
    }
  }

  return Handler.Ok({
    status,
    message,
  });
};

module.exports.updateUserInCompany = async (event, action) => {
  const { companyId, user } = action;

  try {
    // -------------------- validação inicio
    const permissionsUser = await userController.getPermissionsCompanyByUser(
      companyId,
      user.id
    );
    const onlyPermission = ["acesso_company_config"];

    if (
      permissionsUser.filter((permission) =>
        onlyPermission.includes(permission.permission)
      ).length === 0
    ) {
      return Handler.Unauthorized(action);
    }

    const rolesUser = await userController.getRolesCompanyByUser(
      companyId,
      user.id
    );
    const onlyRole = ["company_admin", "associado", "associado_nivel_2"];

    if (rolesUser.filter((role) => onlyRole.includes(role.role)).length === 0) {
      return Handler.Unauthorized(action);
    }

    if (rolesUser.length === 1) {
      if (
        rolesUser.filter((role) => role.role === "associado_nivel_2").length > 0
      ) {
        const companyIsHomologada = await userController.companyIsHomologada(
          companyId
        );
        if (companyIsHomologada) return Handler.Unauthorized(action);
      }
    }
    // -------------------- validação termino.

    const body = JSON.parse(event.body);
    const { name, email, job, role, status } = body;

    // verifica se existe em responsavel
    let responsavel = await Empresa_Responsaveis.findOne({
      where: {
        email,
        EmpresaId: companyId,
      },
      raw: true,
    });
    let convidado = await userController.raw_query(
      `
      SELECT EU.EmpresaId, UM.id, UM.nome, UM.email, EU.cargo
      FROM Empresa_Usuarios AS EU 
          INNER JOIN Usuario_Migrar AS UM ON EU.UsuarioId = UM.id
      WHERE UM.email = :email and EU.EmpresaId = :companyId
    `,
      { companyId, email }
    );
    convidado = convidado.length > 0 ? convidado[0] : null;

    if (!responsavel && !convidado) {
      await Logger.setLog(action, "email_not_found", `Usuário não localizado`);
      return Handler.BadRequest({
        status: "email_not_found",
        message: "Usuário não localizado",
      });
    }

    if (responsavel) {
      const fields = {};
      if (job !== undefined && responsavel.cargo !== job) fields.cargo = job;
      if (name !== undefined && responsavel.nome !== name) fields.nome = name;
      if (
        status !== undefined &&
        responsavel.active !== status &&
        responsavel.email !== user.email
      )
        fields.active = status;
      if (Object.keys(fields).length > 0) {
        const filter = {
          where: {
            email,
            EmpresaId: companyId,
          },
        };
        await Empresa_Responsaveis.update(fields, filter)
          .then(async () =>
            Logger.setSuccessLog(
              action,
              `Responsável [${responsavel.nome}] atualizado com sucesso`
            )
          )
          .catch(async (error) => {
            console.error(responsavel, error);
            await Logger.setLog(
              action,
              "fatal_error",
              `Erro ao atualizar responsável: ${error}`
            );
          });
      }
    } else {
      responsavel = {
        EmpresaId: companyId,
        nome: name,
        email,
        cargo: job,
        active: true,
      };
      await Empresa_Responsaveis.create(responsavel, { raw: true })
        .then(async () =>
          Logger.setLog(
            action,
            "success",
            `Responsável [${responsavel.nome}] cadastrado com sucesso`
          )
        )
        .catch(async (error) => {
          console.error(responsavel, error);
          await Logger.setLog(
            action,
            "fatal_error",
            `Erro ao cadastrar responsável: ${error}`
          );
        });
    }

    let message = "Usuário atualizado com sucesso";

    if (name && email && job && role) {
      const permisionsRole =
        await userController.getPermissionsCompanyByRoleCompany(role);
      if (permisionsRole.length > 0) {
        if (convidado) {
          // atualiza role
          await userController.setNewRoleCompanyToUser(
            companyId,
            convidado.id,
            role
          );
          if (role !== "associado_nivel_2") {
            await userController.removeAssociateNive2AllCompanies(
              user.id,
              companyId,
              convidado.id,
              event,
              action
            );
          }

          const fields = {};
          if (convidado.cargo !== job) fields.cargo = job;
          if (Object.keys(fields).length > 0) {
            const filter = {
              where: {
                UsuarioId: convidado.id,
                EmpresaId: companyId,
              },
            };
            await Empresa_Usuarios.update(fields, filter)
              .then(async () =>
                Logger.setLog(
                  action,
                  "success",
                  `Usuário [${responsavel.nome}] atualizado com sucesso`
                )
              )
              .catch(async (error) => {
                console.error(responsavel, error);
                await Logger.setLog(
                  action,
                  "fatal_error",
                  `Erro ao atualizar usuário: ${error}`
                );
              });
          }
        } else {
          // envia convite para acesso
          const empresa = await Empresas.findOne({
            where: { id: companyId },
            raw: true,
          });
          const role_company = await Roles_Company.findOne({
            where: { name: role },
            raw: true,
          });

          const mailData = {
            convite: {
              empresa: empresa.nome, // Empresa_Usuario (empresa do owner)
              empresaId: empresa.id, // código da empresa
              nome: name, // dinamico
              email, // dinamico
              cargo: job, // dinamico
              role_company_id: role_company.id,
            },
            host: user,
          };

          const statusSave = await saveInvite(mailData);
          if (statusSave.status !== "success") {
            return Handler.Error(statusSave);
          }
          const emailCompose = await composeEmailInviteCompany(mailData);
          await Mail.sendMail(emailCompose);

          await Logger.setLog(action, "success", `${statusSave.log}[${role}]`);

          // envia convite para acesso
          message =
            "Atualizado com sucesso. Como o usuário ainda não possuia acesso a empresa, foi encaminhado um convite :)";
        }
      } else {
        if (convidado) {
          // remove as permissões de acesso
          await userController.setNewRoleCompanyToUser(
            companyId,
            convidado.id,
            role
          );
          await userController.removeAccessUserFromCompany(
            convidado.id,
            companyId,
            event,
            action,
            convidado.nome
          );
          await userController.updateStatusResponsibleCompany(
            convidado.email,
            companyId,
            0,
            event,
            action
          );
          await userController.removeAssociateNive2AllCompanies(
            user.id,
            companyId,
            convidado.id,
            event,
            action
          );

          message =
            "O usuário não possui mais acesso a empresa e nas empresas que estava como associado nivel 2 :)";
        } else {
          message = "O usuário não possui mais acesso a empresa :)";
        }

        const filter = {
          where: {
            email,
            EmpresaId: companyId,
          },
        };
        await Usuario_Convites.destroy(filter)
          .then(async () =>
            Logger.setLog(
              action,
              "success",
              `Convite [${email}] removido com sucesso`
            )
          )
          .catch(async (error) => {
            console.error(responsavel, error);
            await Logger.setLog(
              action,
              "fatal_error",
              `Erro ao remover convite: ${error}`
            );
          });
      }
    } else if (email !== user.email) {
      const isUserGuest = await raw.query(`
        SELECT Empresa_Usuarios.id
        FROM  Empresa_Usuarios INNER JOIN Usuario_Migrar ON Empresa_Usuarios.UsuarioId = Usuario_Migrar.id
        WHERE 
          Empresa_Usuarios.EmpresaId = '${companyId}'
            AND Usuario_Migrar.email = '${email}' 
            AND Empresa_Usuarios.active != ${status}  
      `);

      if (isUserGuest.length > 0) {
        const company = isUserGuest[0];
        const fields = {
          active: status,
        };
        const filter = {
          where: {
            id: company.id,
          },
        };
        await Empresa_Usuarios.update(fields, filter)
          .then(async () =>
            Logger.setLog(
              action,
              "success",
              `Usuário [${responsavel.nome}] atualizado com sucesso`
            )
          )
          .catch(async (error) => {
            console.error(responsavel, error);
            await Logger.setLog(
              action,
              "fatal_error",
              `Erro ao atualizar usuário: ${error}`
            );
          });
      }
    }

    return Handler.Ok({
      status: "success",
      message,
    });
  } catch (error) {
    return Handler.Exception(action, error);
  }
};

module.exports.empresas_usuarios_convite_aceite = async (event, action) => {
  try {
    const { user } = action;
    const userId = user.id;
    const { email } = user;

    const { empresa, aceito } = JSON.parse(event.body);
    if (!empresa || aceito === undefined) {
      await Logger.setLog(
        action,
        "bad_request",
        `Tentativa de aceite de convite: Campos obrigtórios ausente`
      );
      return Handler.BadRequest({
        message: "Campos obrigtórios ausente",
      });
    }

    const filterInvites = {
      where: {
        email,
        EmpresaId: empresa,
      },
      raw: true,
    };
    const invitesPromise = await Usuario_Convites.findOne(filterInvites);

    const filterCompanies = {
      where: {
        id: empresa,
      },
      raw: true,
    };
    const companyPromise = await Empresas.findOne(filterCompanies);

    const [invites, company] = await Promise.all([
      invitesPromise,
      companyPromise,
    ]);

    // verifica se o convite existe
    if (!invites || invites.length === 0) {
      await Logger.setLog(
        action,
        "invite_not_found",
        `Convite não encontrado da empresa [${empresa}] para o e-mail [${email}]`
      );
      return Handler.Fail({
        status: "invite_not_found",
        message:
          "Não existe um convite pendente para seu usuário na empresa informada.",
      });
    }

    // verifica se a empresa existe
    if (!company) {
      return Handler.Fail({
        status: "company_not_found",
        message: "Empresa não encontrada.",
      });
    }

    // verifica se o usuário já está associado a empresa
    const filterLinked = {
      where: {
        EmpresaId: empresa,
        UsuarioId: userId,
      },
      raw: true,
    };
    const response = await Empresa_Usuarios.findAll(filterLinked);
    if (response.length > 0) {
      await deleteInvite(email, empresa, event, action);
      return Handler.Fail({
        status: "duplicated_cnpj",
        message: `A empresa ${company.nome} já está associada ao seu usuário`,
      });
    }

    let status;
    let log;
    let message;

    if (aceito) {
      const payload = {
        EmpresaId: empresa,
        UsuarioId: userId,
        nome: user.nome,
        email,
        cargo: invites.cargo,
        active: true,
        invited: true,
        accept: true,
        owner: false,
        invitedAt: moment().format(),
        acceptAt: moment().format(),
      };
      await Empresa_Usuarios.create(payload)
        .then(async () => {
          status = "success";
          log = "Usuário vinculado com sucesso na empresa";
          message = "Convite aceito com sucesso";
        })
        .catch(async (error) => {
          console.error(error);
          status = "fatal_error";
          log = `Erro ao vincular: ${error}`;
          message = "Ocorre um erro ao aceitar o convite :(";
        });
      await Logger.setLog(action, status, log);

      const filterResponsavel = {
        where: {
          EmpresaId: empresa,
          email,
        },
        raw: true,
      };
      const responsavel = await Empresa_Responsaveis.findOne(filterResponsavel);
      if (!responsavel) {
        const responsavelPayload = {
          EmpresaId: empresa,
          nome: user.nome,
          email,
          cargo: invites.cargo,
          active: true,
        };
        await Empresa_Responsaveis.create(responsavelPayload, { raw: true });
        await Logger.setSuccessLog(
          action,
          `Novo responsável cadastrado [${responsavelPayload.nome}]`
        );
      }
    } else {
      status = "success";
      log = "Convite recusado com sucesso na empresa";
      message = "Convite recusado com sucesso";
      await Logger.setLog(action, status, log);
    }

    if (status === "success") {
      if (invites.role_company_id) {
        const role = await Roles_Company.findOne({
          where: { id: invites.role_company_id },
          raw: true,
        });
        await userController.setNewRoleCompanyToUser(
          empresa,
          userId,
          role.name
        );
        await Logger.setSuccessLog(action, `Perfil: ${role.name}`);
      }
      await deleteInvite(email, empresa, event, action);
    }

    return Handler.Ok({
      status,
      message,
    });
  } catch (e) {
    return Handler.Exception(action, e);
  }
};

module.exports.empresas_usuario_convite_cancelar = async (event, action) => {
  const body = JSON.parse(event.body);
  const { empresa, email } = body;
  const { user } = action;
  const companyId = empresa;

  // -------------------- validação inicio
  const permissionsUser = await userController.getPermissionsCompanyByUser(
    companyId,
    user.id
  );
  const onlyPermission = ["acesso_company_config"];

  if (
    permissionsUser.filter((permission) =>
      onlyPermission.includes(permission.permission)
    ).length === 0
  ) {
    return Handler.Unauthorized(action);
  }

  const rolesUser = await userController.getRolesCompanyByUser(
    companyId,
    user.id
  );
  const onlyRole = ["company_admin", "associado", "associado_nivel_2"];

  if (rolesUser.filter((role) => onlyRole.includes(role.role)).length === 0) {
    return Handler.Unauthorized(action);
  }

  if (rolesUser.length === 1) {
    if (
      rolesUser.filter((role) => role.role === "associado_nivel_2").length > 0
    ) {
      const companyIsHomologada = await userController.companyIsHomologada(
        companyId
      );
      if (companyIsHomologada) return Handler.Unauthorized(action);
    }
  }
  // -------------------- validação termino

  const filterConvites = {
    where: {
      email,
      EmpresaId: empresa,
    },
    raw: true,
  };
  await Usuario_Convites.destroy(filterConvites)
    .then(async () => {
      console.info("Convite excluído com sucesso");
      await Logger.setLog(
        action,
        "success",
        `Convite para o usuário [${email}] revogado com sucesso`
      );
    })
    .catch((error) => {
      console.error(error);
    });

  return Handler.Ok({
    status: "success",
    message: "Convite cancelado com sucesso.",
  });
};

module.exports.empresas_usuario_reenviar_convite = async (event, action) => {
  const body = JSON.parse(event.body);
  const { user } = action;
  const { empresa, email } = body;
  const companyId = empresa;

  // -------------------- validação inicio
  const permissionsUser = await userController.getPermissionsCompanyByUser(
    companyId,
    user.id
  );
  const onlyPermission = ["acesso_company_config"];

  if (
    permissionsUser.filter((permission) =>
      onlyPermission.includes(permission.permission)
    ).length === 0
  ) {
    return Handler.Unauthorized(action);
  }

  const rolesUser = await userController.getRolesCompanyByUser(
    companyId,
    user.id
  );
  const onlyRole = ["company_admin", "associado", "associado_nivel_2"];

  if (rolesUser.filter((role) => onlyRole.includes(role.role)).length === 0) {
    return Handler.Unauthorized(action);
  }

  if (rolesUser.length === 1) {
    if (
      rolesUser.filter((role) => role.role === "associado_nivel_2").length > 0
    ) {
      const companyIsHomologada = await userController.companyIsHomologada(
        companyId
      );
      if (companyIsHomologada) return Handler.Unauthorized(action);
    }
  }
  // -------------------- validação termino

  let status;
  let message;

  const filterConvites = {
    where: {
      email,
      EmpresaId: empresa,
    },
    raw: true,
  };
  const convite = await Usuario_Convites.findOne(filterConvites);

  if (convite) {
    let owner;

    const filterUser = {
      where: {
        cognito_id: convite.UsuarioId,
      },
      raw: true,
    };
    await Usuario_Migrar.findOne(filterUser).then(async (userData) => {
      owner = userData;
    });

    const mailData = {
      convite: {
        empresa: convite.nomeEmpresa,
        empresaId: convite.EmpresaId,
        nome: convite.nome,
        email: convite.email,
      },
      host: owner,
    };
    const emailCompose = await composeEmailInviteCompany(mailData);

    const statusSendMail = await Mail.sendMail(emailCompose);
    if (!statusSendMail) {
      return Handler.Error({
        message: `Não foi possível reenviar o e-mail para ${mailData.convite.nome} (${mailData.convite.email})`,
      });
    }

    status = "success";
    message = `Convite reenviado com sucesso para ${convite.nome} (${convite.email})`;
  } else {
    status = "invite_not_found";
    message = `Convite para ${email} não foi localizado`;
  }

  await Logger.setLog(action, status, message);

  return Handler.Ok({
    status,
    message,
  });
};

module.exports.empresas_detalhes = async (event, action) => {
  const { companyId } = action;
  const user = action.user.id;

  try {
    let empresa;
    if (!action.requestIsDemo) {
      const queryCompany = `
      SELECT 
          Empresas.id, Empresas.nome, Empresas.cnpj, Empresas.active, Empresa_Usuarios.owner,
          case
            when Empresas_Premium.empresa_homologada = 0 and Empresas_Premium.data_final_premium is null then true
            when Empresas_Premium.empresa_homologada = 1 then true
            when Empresas_Premium.empresa_homologada = 2 and Empresas_Premium.data_final_premium >= NOW() then true
              else false
          end as is_premium,
          case
            when Empresas_Premium.empresa_homologada = 2 and Empresas_Premium.data_final_premium >= NOW() then true
              else false
          end as is_trial,
          case
            when Empresas_Premium.empresa_homologada = 1 and Empresa_Usuarios.owner = 1 then true
              else false
          end as is_associada,
          Empresas_Premium.data_final_premium
      FROM 
          Empresa_Usuarios
          INNER JOIN Empresas ON (Empresa_Usuarios.EmpresaId = Empresas.id)
          LEFT OUTER JOIN Empresas_Premium 
            ON (Empresa_Usuarios.EmpresaId = Empresas_Premium.company_id 
              AND (Empresas_Premium.data_final_premium >= NOW() OR Empresas_Premium.data_final_premium is null)
            ) 
      WHERE Empresas.id = :companyId and Empresa_Usuarios.UsuarioId = :userId
      `;
      empresa = await userController.raw_query(queryCompany, {
        companyId,
        userId: user,
      });
    } else {
      const queryCompany = `
        SELECT Empresas.*
        FROM Empresas
        WHERE Empresas.id = :companyId 
          AND Empresas.demo = 1      
      `;
      empresa = await userController.raw_query(queryCompany, {
        companyId,
      });
    }

    if (empresa.length === 0) {
      if (userController.validateProfile(action.user.id, ["superadmin"])) {
        const queryCompany = `
        SELECT Empresas.*,
            case
              when Empresas_Premium.empresa_homologada = 0 and Empresas_Premium.data_final_premium is null then true
              when Empresas_Premium.empresa_homologada = 1 then true
              when Empresas_Premium.empresa_homologada = 2 and Empresas_Premium.data_final_premium >= NOW() then true
                else false
            end as is_premium,
            case
              when Empresas_Premium.empresa_homologada = 2 and Empresas_Premium.data_final_premium >= NOW() then true
                else false
            end as is_trial,
            case
              when Empresas_Premium.empresa_homologada = 1 then true
                else false
            end as is_associada,
            Empresas_Premium.data_final_premium
        FROM 
            Empresas
            LEFT OUTER JOIN Empresas_Premium 
              ON (Empresas.id = Empresas_Premium.company_id 
                AND (Empresas_Premium.data_final_premium >= NOW() OR Empresas_Premium.data_final_premium is null)
              ) 
        WHERE Empresas.id = :companyId 
      `;
        empresa = await userController.raw_query(queryCompany, {
          companyId,
        });
      } else {
        return Handler.Unauthorized(action);
      }
    }
    [empresa] = empresa;

    const exercicios = await getYearsByCompany(companyId, action);
    const usersPermissionsClean = [];

    if (action.requestIsDemo) {
      empresa.roles = ["demo"];
      usersPermissionsClean.push("demo");
      empresa.data_final_premium = null;
    } else {
      const userIsAssociado = await userController.validateProfile(user, [
        "associado",
      ]);
      const usersWithRolesCompany =
        await userController.getUsersWithRolesCompany(companyId);

      if (
        userIsAssociado &&
        usersWithRolesCompany.length === 0 &&
        empresa.owner
      ) {
        const role = empresa.is_associada === 1 ? "company_admin" : "associado";
        await userController.setNewRoleCompanyToUser(companyId, user, role);
      }
      if (
        !userIsAssociado &&
        usersWithRolesCompany.length === 0 &&
        empresa.owner
      ) {
        await userController.setNewRoleCompanyToUser(
          companyId,
          user,
          "company_admin"
        );
      }

      const usersPermissions = await userController.getPermissionsCompanyByUser(
        companyId,
        user
      );
      usersPermissions.map((item) =>
        usersPermissionsClean.push(item.permission)
      );

      const rolesUser = await userController.getRolesCompanyByUser(
        companyId,
        user
      );
      const rolesUserClean = [];
      rolesUser.map((item) => rolesUserClean.push(item.role));
      empresa.roles = rolesUserClean;

      empresa.is_ajuda = false;

      const userCanBeAjuda = await userController.validateProfile(user, [
        "admin",
        "superadmin",
      ]);
      if (userCanBeAjuda) {
        const userInCompany = usersWithRolesCompany.filter(
          (userInCompanyLocal) => userInCompanyLocal.user_id === user
        );
        empresa.is_ajuda = !(userInCompany.length > 0);
      }
    }

    empresa.trial_available = action.requestIsDemo
      ? false
      : await hasTrialAvailable(companyId);

    await Logger.setSuccessLog(action, `Carregando dados de [${empresa.nome}]`);

    return Handler.Ok({
      status: "success",
      empresa,
      exercicios,
      permissions: usersPermissionsClean,
      // modalPermissions: modalPermission,
      demo: action.requestIsDemo,
    });
  } catch (e) {
    return Handler.Exception(action, e);
  }
};

module.exports.empresas_registro = async (event, action) => {
  try {
    const { user } = action;

    const body = JSON.parse(event.body);
    const { nome, active, companyAssociate } = body;
    let { cnpj } = body;

    const userValidate = await userController.validatePermission(user.id, [
      "cadastrar_empresas",
    ]);
    if (!userValidate) {
      if (companyAssociate === "") {
        const filter = {
          attributes: [["id", "empresa"]],
          include: [
            {
              model: Usuario_Migrar,
              as: "users",
              required: true,
              attributes: [["id", "usuario"]],
              through: {
                attributes: ["id", "owner"],
                where: {
                  owner: 1,
                },
              },
              where: {
                id: user.id,
              },
            },
          ],
          raw: true,
        };
        const companiesUser = await Empresas.findAll(filter);

        if (companiesUser.length > 0) {
          await Logger.setLog(
            action,
            "unauthorized",
            "Tentativa de cadastro de empresa"
          );
          return Handler.Unauthorized(
            action,
            {
              message:
                "Você não possui permissão para cadastro de outras empresas",
            },
            {},
            false
          );
        }
      } else {
        const hasPermission = await userController.userIsAssociateNivel2(
          user.id,
          companyAssociate
        );
        if (hasPermission.length === 0) {
          await Logger.setLog(
            action,
            "unauthorized",
            `Tentativa de cadastro de empresa em nome de associado. CompanyId: ${companyAssociate}`
          );
          return Handler.Unauthorized({
            message:
              "Você não possui permissão para cadastro de outras empresas",
          });
        }
      }
    }

    if (!CnpjService.validarCNPJ(cnpj)) {
      return Handler.Fail({
        status: "invalid_cnpj",
        message: "CNPJ inválido",
      });
    }
    cnpj = CnpjService.formatCnpj(cnpj);

    const isDuplicated =
      companyAssociate === ""
        ? await validarEmpresaUsuario(cnpj, user.id)
        : await validarEmpresaAssociado(cnpj, companyAssociate);

    if (isDuplicated) {
      let message = `O CNPJ ${cnpj} já está associado `;
      if (companyAssociate === "") {
        message += "ao seu usuário";
      } else {
        message += "ao usuário do associado responsável";
      }
      return Handler.Fail({
        status: "duplicated_cnpj",
        message,
      });
    }

    let status;
    let message;
    let log;

    const empresaPost = {
      id: uuidGenerate(),
      nome,
      cnpj,
      active,
    };
    await Empresas.create(empresaPost, { raw: true }).then(async (empresa) => {
      // Se o cadastro da empresa foi realizado com sucesso
      // vinculamos o usuário que está cadastrando como owner e ativamos ele.
      if (empresa) {
        await Logger.setSuccessLog(
          action,
          `Nova empresa cadastrada [${empresa.nome}]`
        );
        action.companyId = empresa.id;

        // mandamos para a api de integração para indexação
        CnpjService.setCnpjIntegracao(cnpj);

        // criar anos na tabela de exercicios para vincular os diagnósticos
        const year = new Date().getFullYear();
        await insertYearCompany(empresa.id, year, action);

        // obtemos os dados do usuário para vincular a empresa...
        if (companyAssociate === "") {
          const vinculo = {
            EmpresaId: empresa.id,
            UsuarioId: user.id,
            nome: user.nome,
            email: user.email,
            active: true,
            invited: false,
            accept: false,
            owner: true,
            invitedAt: moment().format(),
            acceptAt: moment().format(),
          };
          await Empresa_Usuarios.create(vinculo, { raw: true })
            .then(async () => {
              status = "success";
              message = "Empresa cadastrada e usuário vinculado";
              await Logger.setSuccessLog(
                action,
                `Usuário vinculado com sucesso na empresa`
              );
            })
            .catch((err) => {
              status = "fatal_error";
              message =
                "Ocorreu um erro ao vincular seu usuário para a nova empresa :(";
              log = `Erro ao vincular a empresa: ${err}`;
              console.error(log);
            });
        } else {
          const associado = (
            await raw.query(`
                SELECT Usuario_Migrar.*
                FROM Empresa_Usuarios INNER JOIN Usuario_Migrar ON Empresa_Usuarios.UsuarioId = Usuario_Migrar.id
                WHERE Empresa_Usuarios.EmpresaId = '${companyAssociate}'
                    AND Empresa_Usuarios.owner = 1
            `)
          )[0];
          const vinculoAssociado = {
            EmpresaId: empresa.id,
            UsuarioId: associado.id,
            nome: associado.nome,
            email: associado.email,
            active: true,
            invited: false,
            accept: false,
            owner: true,
            invitedAt: moment().format(),
            acceptAt: moment().format(),
          };
          await Empresa_Usuarios.create(vinculoAssociado, { raw: true }).then(
            async () => {
              await Logger.setLog(
                action,
                status,
                `Nova empresa cadastrada [${empresa.nome}]`
              );
              await Logger.setLog(
                action,
                status,
                `Usuário [${associado.nome}] vinculado como associado com sucesso na empresa`
              );
              await userController.setNewRoleCompanyToUser(
                empresa.id,
                associado.id,
                "associado"
              );
            }
          );

          const vinculo = {
            EmpresaId: empresa.id,
            UsuarioId: user.id,
            nome: user.nome,
            email: user.email,
            active: true,
            invited: true,
            accept: true,
            owner: false,
            invitedAt: moment().format(),
            acceptAt: moment().format(),
          };
          await Empresa_Usuarios.create(vinculo, { raw: true }).then(
            async () => {
              await Logger.setLog(
                action,
                status,
                "Usuário vinculado com sucesso na empresa"
              );
              await userController.setNewRoleCompanyToUser(
                empresa.id,
                user.id,
                "associado_nivel_2"
              );
            }
          );

          status = "success";
          message = "Empresa cadastrada e usuários vinculados";
        }
      } else {
        status = "fatal_error";
        message = "Ocorreu um erro ao cadastrar a empresa :(";
        log = "Erro ao criar a empresa";
        console.error(log);
        await Logger.setLog(action, status, log);
      }
    });

    if (status === "success") {
      let messageTelegram = "Nova empresa cadastrada:\n\n";
      messageTelegram += `<b>Empresa:</b> ${nome}\n`;
      messageTelegram += `<b>CNPJ:</b> ${cnpj}\n`;
      messageTelegram += `<b>Usuário:</b> ${user.nome} (${user.email})`;
      await telegram.SendMessageAdm(messageTelegram);
    }

    return Handler.Ok({
      status,
      message,
    });
  } catch (error) {
    return Handler.Exception(action, error);
  }
};

module.exports.request_trial_start = async (event, action) => {
  const { companyId } = action;

  const trial_available = await hasTrialAvailable(companyId);
  if (!trial_available) {
    return Handler.BadRequest({
      status: "trial_unavailable",
      message: "Trial não disponível para a empresa",
    });
  }

  const { data_final_premium, empresa_homologada } = await activeTrial(
    companyId
  );
  await Logger.setSuccessLog(action, `Trial ativado com sucesso`);

  return Handler.Ok({
    status: "success",
    message: "Trial ativado com sucesso",
    data_final_premium,
    empresa_homologada,
    trial_available: false,
  });
};

module.exports.empresas_atualizar = async (event, action) => {
  const body = JSON.parse(event.body);
  const { nome, active } = body;

  const update = {
    nome,
    active,
  };
  const filter = {
    where: {
      id: action.companyId,
    },
  };

  let status;
  let message;
  let log;

  await Empresas.update(update, filter)
    .then(() => {
      status = "success";
      message = "Empresa atualizada com sucesso.";
      log = "Os dados da empresa foram atualizados";
    })
    .catch((error) => {
      status = "fatal_error";
      message = "Ocorre um erro ao atualizar a empresa :(";
      log = error;
    });

  await Logger.setLog(action, status, log);

  return Handler.Ok({
    status,
    message,
  });
};

module.exports.empresas_usuarios_convite_meusconvites = async (
  event,
  action
) => {
  const { user } = action;

  try {
    const query = `
      SELECT 
          Usuario_Convites.id, Usuario_Convites.nome as guestName, Usuario_Convites.email as guestEmail,
          Usuario_Convites.cargo as guestJob, Usuario_Convites.createdAt as invitedDate,
          Roles_Company.name as role, Empresas.nome as companyName, Empresas.cnpj as companyCnpj,
          Empresas.id as companyId, HOST.nome as hostName, HOST.email as hostEmail
      FROM 
          Usuario_Convites
          INNER JOIN Empresas ON Usuario_Convites.EmpresaId = Empresas.id
          INNER JOIN Usuario_Migrar AS HOST ON Usuario_Convites.UsuarioId = HOST.cognito_id
          LEFT JOIN Roles_Company ON Usuario_Convites.role_company_id = Roles_Company.id
      WHERE
          Usuario_Convites.email = '${user.email}'
    `;
    const convites = await raw.query(query);

    if (convites.length > 0) {
      await Logger.setSuccessLog(
        action,
        `Novo(s) convite(s): ${convites.length}`
      );
    }

    return Handler.Ok({
      status: "success",
      convites,
    });
  } catch (e) {
    return Handler.Exception(action, e);
  }
};

module.exports.buscar_cnpj = async (event, action) => {
  const { cnpj } = event.pathParameters;
  const cnpjResponse = await CnpjService.findCnpj(cnpj);

  await Logger.setSuccessLog(action, `Buscando pelo CNPJ [${cnpj}]`);

  return Handler.Ok({
    status: "success",
    cnpj: cnpjResponse.data,
  });
};

module.exports.request_premium_active = async (event, action) => {
  const { companyId, user } = action;
  const filter = {
    where: {
      id: companyId,
    },
    raw: true,
  };
  const company = await Empresas.findOne(filter);

  if (await hasPremiumActive(companyId)) {
    return Handler.BadRequest({
      message: "Empresa já está ativada como Premium",
    });
  }

  const body = event.body ? JSON.parse(event.body) : {};
  const payload = {
    company_id: companyId,
    user_id_request: user.id,
    entidade_faturamento: body.entidade,
    cpf: body.cpf,
    nome: body.nome,
    cnpj: body.cnpj,
    nome_fantasia: body.nomeFantasia,
    razao_social: body.razaoSocial,
    telefone: body.telefone,
    endereco_cep: body.enderecoCep,
    endereco_logradouro: body.endereco,
    endereco_numero: body.enderecoNumero,
    endereco_complemento: body.enderecoComplemento,
    endereco_bairro: body.enderecoBairro,
    endereco_cidade: body.enderecoCidade,
    endereco_estado: body.enderecoEstado,
    financeiro_contato: body.contatoFinanceiro,
    financeiro_contato_celular: body.celularContatoFinanceiro,
    financeiro_contato_email: body.emailContatoFinanceiro,
    fatura_tipo: body.tipo,
    fatura_valor: body.valor,
    fatura_recorrencia: body.pagamento,
    fatura_dia_vencimento: body.diaVencimento,
  };
  const whiteList = ["endereco_complemento"];

  const errors = [];
  const keys = Object.keys(payload);
  for (const key of keys) {
    const value = payload[key];
    if (value === undefined || value === null || value === "") {
      if (whiteList.indexOf(key) >= 0) continue;
      if (payload.entidade_faturamento === "J" && key === "cpf") continue;
      if (payload.entidade_faturamento === "J" && key === "nome") continue;
      if (payload.entidade_faturamento === "F" && key === "cnpj") continue;
      if (payload.entidade_faturamento === "F" && key === "nome_fantasia")
        continue;
      if (payload.entidade_faturamento === "F" && key === "razao_social")
        continue;
      errors.push(key);
    }
  }

  if (errors.length > 0) {
    return Handler.BadRequest({
      message: "Campos obrigatórios não preenchidos",
      fields: errors,
    });
  }

  const filterCompany = {
    where: {
      company_id: companyId,
    },
    raw: true,
  };
  const dadosFaturamento = await Empresas_Premium_Faturamento.findOne(
    filterCompany
  );
  if (dadosFaturamento) {
    await Empresas_Premium_Faturamento.update(payload, filterCompany);
    await Logger.setLog(
      action,
      "success",
      `Dados de faturamento atualizados com sucesso`
    );
  } else {
    await Empresas_Premium_Faturamento.create(payload);
    await Logger.setLog(
      action,
      "success",
      `Dados de faturamento cadastrados com sucesso`
    );
  }

  const { data_final_premium, empresa_homologada } = await activePremium(
    company,
    user
  );

  const promises = [];

  let messageTelegram = "Assinatura Premium:\n\n";
  messageTelegram += `<b>Empresa:</b> ${company.nome}\n`;
  messageTelegram += `<b>CNPJ:</b> ${company.cnpj}\n`;
  messageTelegram += `<b>Id:</b> ${company.id}\n`;
  messageTelegram += `<b>Usuário que Ativou:</b> ${user.nome}\n`;
  messageTelegram += `<b>E-mail:</b> ${user.email}\n`;
  promises.push(telegram.SendMessageAdm(messageTelegram));

  const usersMail = await userController.getUsersByPermission([
    "email_new_upgrade_associado",
  ]);
  if (usersMail.length > 0) {
    const emails = usersMail.map((userData) => userData.email);
    const bodyMail = messageTelegram.replace(/\n/g, "<br/>");
    promises.push(
      Mail.sendMail({
        bcc: emails,
        subject: "Assinatura Premium",
        body: bodyMail,
      })
    );
  }

  promises.push(
    Logger.setLog(action, "success", `Premium ativado com sucesso`)
  );

  await Promise.all(promises);

  return Handler.Ok({
    status: "success",
    message: "Premium ativado com sucesso",
    data_final_premium,
    empresa_homologada,
    trial_available: false,
  });
};

module.exports.sheet_download_dre = async (event, action) => {
  const { company } = action;
  const { year } = event.pathParameters;

  const workbook = new WorkbookDre();
  const s3 = new AWS.S3({ apiVersion: "2006-03-01", region: "sa-east-1" });
  const { BUCKET_PLANILHAS_INTEGRACAO } = process.env;

  const paramsTemplate = {
    Bucket: BUCKET_PLANILHAS_INTEGRACAO.replace("-local", ""),
    Key: "templates/Planilha_BSC_Dre_v_1_0_0.xlsx",
  };
  const streamItem = s3.getObject(paramsTemplate).createReadStream();
  await workbook.readStream(streamItem);

  // contextualiza
  const companyData = await company.getCompanyData();
  await Promise.all([
    company.getDreByYear(year - 1),
    company.getDreByYear(year - 2),
    company.getDreByYear(year - 3),
  ]);
  workbook.setCompanyContext(
    companyData.nome,
    companyData.cnpj,
    year - 1,
    company.dre
  );

  // gera link
  const newStream = new Stream.PassThrough();
  await workbook.saveToStream(newStream);

  const extension = "xlsx";
  const cleanCnpj = companyData.cnpj.replace(/[^0-9]+/g, "");
  const fileName = `BSC_Dre_${year}_${cleanCnpj}.${extension}`;
  const s3Key = `${cleanCnpj}/${year}/${fileName}`;

  const paramsNewStream = {
    Bucket: BUCKET_PLANILHAS_INTEGRACAO.replace("-local", ""),
    Key: s3Key,
    Body: newStream,
    ACL: "public-read",
    ContentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  const { Key } = await s3.upload(paramsNewStream).promise();

  const params_download = {
    Bucket: BUCKET_PLANILHAS_INTEGRACAO.replace("-local", ""),
    Key,
    Expires: 60,
  };
  const url = await s3.getSignedUrlPromise("getObject", params_download);

  await Logger.setLog(
    action,
    "success",
    `Download de planilha de integração - DRE - ${year}`
  );

  return Handler.Ok({
    message: "Documento disponível",
    url,
  });
};

module.exports.sheet_download_diagnostic = async (event, action) => {
  const { company } = action;
  const { year } = event.pathParameters;

  const workbook = new WorkbookDiagnostico();
  const s3 = new AWS.S3({ apiVersion: "2006-03-01", region: "sa-east-1" });
  const { BUCKET_PLANILHAS_INTEGRACAO } = process.env;

  const paramsTemplate = {
    Bucket: BUCKET_PLANILHAS_INTEGRACAO.replace("-local", ""),
    Key: "templates/Planilha_BSC_Diagnostico_Interno_v_1_0_0.xlsx",
  };
  const streamItem = s3.getObject(paramsTemplate).createReadStream();
  await workbook.readStream(streamItem);

  // contextualiza
  const companyData = await company.getCompanyData();
  await Promise.all([
    company.getProcessesByYear(year - 1),
    company.getProcessesByYear(year - 2),
    company.getProcessesByYear(year - 3),
    company.getCommercialByYear(year - 1),
    company.getCommercialByYear(year - 2),
    company.getCommercialByYear(year - 3),
    company.getPeopleByYear(year - 1),
    company.getPeopleByYear(year - 2),
    company.getPeopleByYear(year - 3),
  ]);
  await workbook.setCompanyContext(
    companyData.nome,
    companyData.cnpj,
    year - 1,
    company
  );

  // gera link
  const newStream = new Stream.PassThrough();
  await workbook.saveToStream(newStream);

  const extension = "xlsx";
  const cleanCnpj = companyData.cnpj.replace(/[^0-9]+/g, "");
  const fileName = `BSC_Diagnostico_Interno_${year}_${cleanCnpj}.${extension}`;
  const s3Key = `${cleanCnpj}/${year}/${fileName}`;

  const paramsNewStream = {
    Bucket: BUCKET_PLANILHAS_INTEGRACAO.replace("-local", ""),
    Key: s3Key,
    Body: newStream,
    ACL: "public-read",
    ContentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  const { Key } = await s3.upload(paramsNewStream).promise();

  const params_download = {
    Bucket: BUCKET_PLANILHAS_INTEGRACAO.replace("-local", ""),
    Key,
    Expires: 60,
  };
  const url = await s3.getSignedUrlPromise("getObject", params_download);

  await Logger.setLog(
    action,
    "success",
    `Download de planilha de integração - Diagnóstico Interno - ${year}`
  );

  return Handler.Ok({
    message: "Documento disponível",
    url,
  });
};

module.exports.sheet_upload = async (event, action) => {
  const { company, companyId } = action;

  if (!event.body) {
    return Handler.BadRequest({
      message: "Body unavailable",
    });
  }

  const body = JSON.parse(event.body);

  const { file, sheet } = body;

  if (!file || !sheet) {
    return Handler.BadRequest({
      message: "Body not found",
    });
  }

  if (!["diagnostico", "dre"].includes(sheet)) {
    return Handler.BadRequest({
      message: "Sheet unknown",
    });
  }

  const base64File = file.split(";base64,").pop();

  const urlPath = `/tmp/${uuidGenerate()}.xlsx`;

  await fs.writeFile(urlPath, base64File, {
    encoding: "base64",
  });

  try {
    const workbook =
      sheet === "dre" ? new WorkbookDre() : new WorkbookDiagnostico();
    await workbook.readFile(urlPath);

    const dataFromFile = workbook.getData();

    const companyData = await company.getCompanyData();
    if (companyData.cnpj.match(/\d+/g).join("") !== dataFromFile.cnpjCleansed) {
      return Handler.BadRequest({
        message: `CNPJ informado no arquivo não pertence a empresa ${companyData.nome}`,
      });
    }

    if (sheet === "dre") {
      await Promise.all([
        saveDreFromSheet(dataFromFile, companyId, action),
        saveClientesFromSheet(dataFromFile, companyId, action),
        saveFornecedoresFromSheet(dataFromFile, companyId, action),
        saveConcorrentesFromSheet(dataFromFile, companyId, action),
      ]);
    } else if (sheet === "diagnostico") {
      await Promise.all([
        saveComercialFromSheet(dataFromFile, companyId, action),
        saveProcessosFromSheet(dataFromFile, companyId, action),
        savePessoasFromSheet(dataFromFile, companyId, action),
      ]);
    }

    return Handler.Ok({
      message: "Dados atualizados com sucesso :)",
      data_file: dataFromFile,
    });
  } catch (error) {
    return Handler.Exception(action, error, {
      message: "O arquivo enviado não é válido",
    });
  }
};
