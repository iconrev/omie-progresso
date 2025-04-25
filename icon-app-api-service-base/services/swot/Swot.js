const { Sequelize } = require("sequelize");
const Handler = require("../handler");
const Logger = require("../../auth/logService");
const userController = require("../../auth/userController");
const models = require("../../models");

const { Swot_Oportunidades } = models;
const { Swot_Ameacas } = models;

const getAmeacas = async (companyId, ano, maxItems) => {
  const list_ameacas = [];

  const filterAmeacas = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: ano,
    },
    limit: maxItems,
    order: [["pontos", "DESC"]],
    attributes: [Sequelize.fn("DISTINCT", Sequelize.col("descricao"))],
    raw: true,
  };
  await Swot_Ameacas.findAll(filterAmeacas)
    .then((ameacas) => {
      console.info("AMEACAS ->", ameacas);
      ameacas.forEach((element) => list_ameacas.push(element.descricao));
    })
    .catch((err) => {
      console.info("ERRO AMEAÇAS ->", err);
    });

  return list_ameacas;
};

const getOportunidades = async (companyId, ano, maxItems) => {
  const list_oportunidades = [];

  const filterOportunidades = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: ano,
    },
    limit: maxItems,
    order: [["pontos", "DESC"]],
    attributes: [Sequelize.fn("DISTINCT", Sequelize.col("descricao"))],
    raw: true,
  };
  await Swot_Oportunidades.findAll(filterOportunidades)
    .then((oportunidades) => {
      console.info("OPORTUNIDADES ->", oportunidades);
      oportunidades.forEach((element) =>
        list_oportunidades.push(element.descricao)
      );
    })
    .catch((err) => {
      console.info("ERRO OPORTUNIDADE ->", err);
    });

  return list_oportunidades;
};

const getForcasFraquezas = async (companyId, ano, maxItems) => {
  const list_forcas = [];
  const list_fraquezas = [];

  const qry = `
    SELECT  
      a.campo,  a.descricao,  b.status 
    FROM   
      Swot_FFC a 
      LEFT OUTER JOIN Swot_Forca_Fraqueza b ON b.swot_codigo = a.id 
    WHERE 
      b.EmpresaId = :companyId and b.ano_exercicio = :ano 
    ORDER By a.ordem  
  `;

  await userController.raw_query(qry, { companyId, ano }).then((ff_list) => {
    if (ff_list.length > 0) {
      for (let i = 0; i < ff_list.length; i++) {
        const item = ff_list[i];
        if (item.status === "1") {
          if (list_forcas.length < maxItems) {
            list_forcas.push(item.descricao);
          }
        } else if (list_fraquezas.length < maxItems) {
          list_fraquezas.push(item.descricao);
        }
      }
    }
  });

  return {
    forcas: list_forcas,
    fraquezas: list_fraquezas,
  };
};

module.exports.analise = async (event, action) => {
  const { company, companyId } = action;

  let maxItems = 10;
  if (event.queryStringParameters) {
    const { items } = event.queryStringParameters;
    maxItems = Number(items);
  }

  const anos = await company.getExercises();
  const analise = {};

  const executeYear = async (ano) => {
    const promises = [
      getOportunidades(companyId, ano, maxItems),
      getAmeacas(companyId, ano, maxItems),
      getForcasFraquezas(companyId, ano - 1, maxItems),
    ];
    const [oportunidades, ameacas, { forcas, fraquezas }] = await Promise.all(
      promises
    );

    analise[ano] = {
      forca: forcas,
      fraquezas,
      oportunidades,
      ameacas,
    };
  };

  const promises = anos.map((ano) => executeYear(ano));
  await Promise.all(promises);

  await Logger.setLog(action, "success", "Carregando SWOT");

  return Handler.Ok({
    status: "success",
    swot: analise,
  });
};
