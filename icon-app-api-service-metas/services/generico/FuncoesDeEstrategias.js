/* eslint-disable no-param-reassign */
const models = require("../../models");
const {
  Estrategias,
  Objetivo_Estrategias,
  Objetivo_Estrategias_Comercial,
  Objetivo_Estrategias_Processos,
  Objetivo_Estrategias_Pessoas,
} = models;

const getModelAndForeignKeyName = (perspectiva) => {
  let model;
  let foreignKeyName;
  if (perspectiva === "comercial") {
    model = Objetivo_Estrategias_Comercial;
    foreignKeyName = "vendas_id";
  } else if (perspectiva === "processos") {
    model = Objetivo_Estrategias_Processos;
    foreignKeyName = "processos_id";
  } else if (perspectiva === "pessoas") {
    model = Objetivo_Estrategias_Pessoas;
    foreignKeyName = "pessoas_id";
  } else {
    model = Objetivo_Estrategias;
    foreignKeyName = "dre_id";
  }

  return {
    model,
    foreignKeyName,
  };
};

module.exports.PerspectivasAtivas = [
  "financeiro",
  "comercial",
  "processos",
  "pessoas",
];

module.exports.LimiteDeEstrategias = () => 2;

module.exports.SalvarAtualizarEstrategias = async (
  perspectiva,
  categoria,
  estrategias_selecionadas,
  empresaId,
  foreingKeyId
) => {
  const { model, foreignKeyName } = getModelAndForeignKeyName(perspectiva);
  const query = {
    include: [
      {
        model: Estrategias,
        where: {
          perspectiva,
          categoria,
        },
      },
    ],
    where: {
      empresa_id: empresaId,
      [foreignKeyName]: foreingKeyId,
    },
    raw: true,
  };
  await model
    .findAll(query)
    .then(async (results) => {
      if (results.length > 0) {
        const ids = [];

        for (let i = 0; i < results.length; i++) {
          const result = results[i];

          const pos = estrategias_selecionadas
            .map((e) => parseInt(e.value))
            .indexOf(result.estrategia_id);

          if (pos >= 0) {
            const estrategia = estrategias_selecionadas[pos];

            if (estrategia.descricao === result.descricao) {
              console.info("ESTRATÉGIA JÁ ESTÁ NO BANCO");
              estrategias_selecionadas.splice(pos, 1);
            } else {
              console.info("ESTRATÉGIA NÃO ESTÁ NO BANCO");
              ids.push(result.id);
            }

            // console.info('ESTRATÉGIA JÁ ESTÁ NO BANCO')
            // estrategias_selecionadas.splice(pos, 1);
          } else {
            console.info("ESTRATÉGIA NÃO ESTÁ NO BANCO");
            ids.push(result.id);
          }
        }

        if (ids.length > 0) {
          await model
            .destroy({ where: { id: ids } })
            .then((result) => {
              console.info("Estratégias excluídas com sucesso");
            })
            .catch((err) => {
              console.error("Erro ao excluídas estratégias:", err);
            });
        }
      }

      if (estrategias_selecionadas.length > 0) {
        for (let i = 0; i < estrategias_selecionadas.length; i++) {
          estrategias_selecionadas[i].empresa_id = empresaId;
          estrategias_selecionadas[i][foreignKeyName] = foreingKeyId;
          estrategias_selecionadas[i].estrategia_id =
            estrategias_selecionadas[i].value;
          estrategias_selecionadas[i].definida = 0;
        }

        await model
          .bulkCreate(estrategias_selecionadas)
          .then((result) => {
            console.info("Estratégias incluídas com sucesso");
          })
          .catch((err) => {
            console.error("Erro ao incluir estratégias:", err);
          });
      } else {
        console.info("Nenhuma estratégia para adicionar");
      }
    })
    .catch((err) => {
      console.error(err);
    });

  return true;
};

module.exports.getEstrategiasCadastradas = async (
  empresaId,
  foreingKeyId,
  perspectiva,
  categoria
) => {
  const { model, foreignKeyName } = getModelAndForeignKeyName(perspectiva);

  const query = {
    include: [
      {
        model: Estrategias,
        where: {
          perspectiva,
          categoria,
        },
      },
    ],
    where: {
      empresa_id: empresaId,
      [foreignKeyName]: foreingKeyId,
    },
    order: [["descricao", "ASC"]],
    raw: true,
  };

  const estrategias = [];

  try {
    await model
      .findAll(query)
      .then((result) => {
        for (let i = 0; i < result.length; i++) {
          const descricaoEscrita = result[i].descricao;
          const descricaoDefault = result[i]["Estrategia.descricao"];

          let estrategiaTemp = {};

          if (
            descricaoEscrita !== null &&
            descricaoEscrita !== descricaoDefault
          ) {
            estrategiaTemp = {
              label: result[i].descricao,
              descricao: result[i].descricao,
              value: Math.random(),
              innerValue: result[i]["Estrategia.id"],
            };
          } else {
            estrategiaTemp = {
              label: result[i]["Estrategia.descricao"],
              descricao: result[i]["Estrategia.descricao"],
              value: result[i]["Estrategia.id"],
              innerValue: result[i]["Estrategia.id"],
            };
          }

          if (result[i].field) {
            estrategiaTemp.field = result[i].field;
          }

          estrategias.push(estrategiaTemp);
        }
      })
      .catch((err) => {
        console.error("getEstrategiasCadastradas", err);
      });
  } catch (e) {
    console.info("Erro ao buscar estratégias cadastradas", e);
  }

  return estrategias;
};

module.exports.getEstrategiasDisponiveis = async (perspectiva, categoria) => {
  console.info("Buscando estratégias disponíveis");

  const estrategias = [];

  try {
    const filterEstrategia = {
      where: { perspectiva, categoria },
      order: [["descricao", "ASC"]],
      raw: true,
    };
    await Estrategias.findAll(filterEstrategia)
      .then((result) => {
        for (let i = 0; i < result.length; i++) {
          estrategias.push({
            value: result[i].id,
            label: result[i].descricao,
            quiz: result[i].quiz,
          });
        }
      })
      .catch((err) => {
        console.error("getEstrategiasDisponiveis", err);
      });
  } catch (e) {
    console.info("Erro ao buscar estratégias", e);
  }

  return estrategias;
};

module.exports.atualizarEstrategiaMapa = async (estrategia, new_status) => {
  const perspectiva = estrategia["Estrategia.perspectiva"];
  const { model } = getModelAndForeignKeyName(perspectiva);
  const data = {
    definida: new_status,
  };

  if (new_status === 0) {
    data.diretriz = "estrategias";
  }

  const query = {
    where: {
      id: estrategia.id,
    },
    raw: true,
  };
  await model
    .update(data, query)
    .then(async (result) => {
      console.info(result);
    })
    .catch((err) => {
      console.error(err);
    });
};

module.exports.atualizarEstrategiaDiretriz = async (estrategia, new_status) => {
  const perspectiva = estrategia["Estrategia.perspectiva"];
  const { model } = getModelAndForeignKeyName(perspectiva);
  const data = {
    diretriz: new_status,
  };
  const query = {
    where: {
      id: estrategia.id,
    },
    raw: true,
  };

  return new Promise((resolve, reject) => {
    model
      .update(data, query)
      .then(async (result) => {
        if (result[0] === 0) {
          return reject("Estratégia não localizada");
        }
        return resolve("success");
      })
      .catch((err) => reject(err));
  });
};

module.exports.getForeignKeyIdByYear = async (year, companyId, model) => {
  let response = null;

  const query = {
    attributes: ["id"],
    where: {
      EmpresaId: companyId,
      ano_exercicio: year,
    },
    raw: true,
  };

  await model
    .findOne(query)
    .then((result) => {
      response = result;
    })
    .catch((err) => {
      console.error("getForeignKeyIdByYear", err);
    });

  return response;
};

module.exports.getStrategyByForeignKeyId = async (
  foreignKeyId,
  foreignKeyName,
  model
) => {
  let response = null;

  const query = {
    include: [
      {
        model: Estrategias,
      },
    ],
    where: {
      [foreignKeyName]: foreignKeyId,
      definida: true,
    },
    raw: true,
  };

  await model
    .findAll(query)
    .then((result) => {
      response = result;
    })
    .catch((err) => {
      console.error("getForeignKeyIdByYear", err);
    });

  return response;
};

module.exports.getStrategyByPrimaryKeyId = async (
  primaryKeyId,
  perspectiva
) => {
  let response = null;

  const { model } = getModelAndForeignKeyName(perspectiva);

  const query = {
    where: {
      id: primaryKeyId,
    },
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
    raw: true,
  };

  await model
    .findOne(query)
    .then((result) => {
      response = result;
    })
    .catch((err) => {
      console.error("getForeignKeyIdByYear", err);
    });

  return response;
};
