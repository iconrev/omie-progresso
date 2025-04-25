/* eslint-disable no-param-reassign */
const Handler = require("../handler");
const { setLog } = require("../../auth/logService");
const {
  atualizarEstrategiaDiretriz,
} = require("../generico/FuncoesDeEstrategias");
const GetModel = require("../generico/GetModel");
const funcoesDeTarefas = require("../generico/FuncoesDeTarefas");
const models = require("../../models");

const { Estrategias } = models;

const getInfoStrategy = async (strategy_id) => {
  const expiredPromise =
    funcoesDeTarefas.getExpiredTasksByStrategyId(strategy_id);
  const status = await funcoesDeTarefas.getStatusTasksByStrategyId(strategy_id);
  const stages = Object.keys(status);
  let total = 0;

  for (let i = 0; i < stages.length; i++) {
    total += status[stages[i]];
  }

  status.tasks = total;
  status.expired = await expiredPromise;

  return status;
};

const getEstrategias = async (
  companyId,
  model,
  perspectiva,
  categoria,
  filterForeignKey
) => {
  const response = [];

  const filterCompany = {
    include: [
      {
        model: Estrategias,
        where: {
          perspectiva: perspectiva.toLowerCase(),
          categoria,
        },
      },
    ],
    where: {
      empresa_id: companyId,
      ...filterForeignKey,
    },
    order: [["descricao", "ASC"]],
    raw: true,
  };
  await model
    .findAll(filterCompany)
    .then(async (result) => {
      if (result) {
        for (let i = 0; i < result.length; i++) {
          const temp = result[i];
          delete temp.createdAt;
          delete temp["Estrategia.createdAt"];
          delete temp.updatedAt;
          delete temp["Estrategia.updatedAt"];
          delete temp["Estrategia.id"];
          delete temp.estrategia_id;
          response.push(temp);
        }
      } else {
        console.info("NADA EXIBIR");
      }
    })
    .catch((err) => {
      console.error("createQuery ->", err);
    });

  return response;
};

const getForeignKeyByYear = async (companyId, foreignKey, ano) => {
  const model = foreignKey.table;
  const { idName } = foreignKey;

  let id = 0;

  const filter = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: ano,
    },
  };
  await model.findOne(filter).then(async (result) => {
    if (result) {
      id = result.id;
    }
  });

  return {
    [idName]: id,
  };
};

module.exports.buscarDadosEstrategias = async (event, action) => {
  const { companyId, company } = action;

  const anos = await company.getExercises();
  const trimestre = event.queryStringParameters
    ? event.queryStringParameters.trimestre
    : null;
  const analise = {};

  const run = async (ano) => {
    analise[ano] = await this.findResults(companyId, ano - 1, trimestre);
  };
  await Promise.all(anos.map(run));

  return Handler.Ok({
    analise,
  });
};

module.exports.salvarDadosEstrategias = async (event, action) => {
  const { companyId } = action;
  const { cards } = JSON.parse(event.body);
  const errors = [];

  const run = async ([key, value]) => {
    console.log(`Verificando: ${value.title}`);
    const cards_key = value.cards;

    const runCard = async (item) => {
      if (item.empresa_id !== companyId) {
        return;
      }

      await atualizarEstrategiaDiretriz(item, key)
        .then(async () => {
          console.info(`Estratégia atualizada com sucesso: ID ${item.id}`);
        })
        .catch((err) => {
          console.error(
            `${err}: ID ${item.id} [${item["Estrategia.perspectiva"]}|${item["Estrategia.categoria"]}]`
          );
          errors.push(item);
        });
    };

    await Promise.all(cards_key.map(runCard));
  };

  await Promise.all(Object.entries(cards).map(run));

  let status = "success";
  let message = "";
  if (errors.length > 0) {
    status = "warning";
    message = "Os seguintes cards não foram atualizados: ";
    for (let i = 0; i < errors.length; i++) {
      message += errors[i].descricao;
      if (i + 1 < errors.length) {
        message += ", ";
      }
    }
  } else {
    message = "Atualização realizada com sucesso";
  }

  await setLog(action, status, message);

  return Handler.Ok({
    status,
    message,
  });
};

module.exports.findResults = async (companyId, ano, trimestre = null) => {
  const result = {
    estrategias: {
      name: "Estratégias",
      items: [],
    },
  };

  const tables = GetModel.allCategory();

  const run = async (perspectiva) => {
    const table_estrategia = tables[perspectiva].estrategias;
    const categorias = Object.keys(tables[perspectiva].objetivos);
    const { foreignKey } = tables[perspectiva];
    const estrategiasPerspectiva = [];

    const runCategoria = async (categoria) => {
      const filterForeignKey = await getForeignKeyByYear(
        companyId,
        foreignKey,
        ano
      );

      const found = await getEstrategias(
        companyId,
        table_estrategia,
        perspectiva,
        categoria,
        filterForeignKey
      );

      const runFound = async (item) => {
        if (trimestre && trimestre !== item.diretriz) {
          return;
        }

        item.info = await getInfoStrategy(item.id);

        if (item.definida === 0) {
          result.estrategias.items.push(item);
        } else {
          estrategiasPerspectiva.push(item);
        }
      };

      await Promise.all(found.map(runFound));
    };

    await Promise.all(categorias.map(runCategoria));

    result[perspectiva.toLowerCase()] = {
      name: perspectiva,
      items: estrategiasPerspectiva,
    };
  };

  await Promise.all(Object.keys(tables).map(run));

  return result;
};
