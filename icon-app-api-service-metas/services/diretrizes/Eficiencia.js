const Handler = require("../handler");
const { setLog } = require("../../auth/logService");
const { findResults } = require("./Estrategias");

const parseSummary = (result) => {
  const estrategias = [];
  let tarefas = 0;
  let atrasadas = 0;
  let implementadas = 0;

  const categorias = Object.keys(result);

  for (let i = 0; i < categorias.length; i++) {
    if (categorias[i] !== "estrategias") {
      const categoria = result[categorias[i]];
      const categoriaItems = categoria.items;

      for (let j = 0; j < categoriaItems.length; j++) {
        const item = categoriaItems[j];
        item.unique_id = `${item["Estrategia.perspectiva"]}_${item["Estrategia.categoria"]}_${item.id}`;
        estrategias.push(item);

        const { info } = item;

        tarefas += info.tasks;
        atrasadas += info.expired;
        implementadas += info.realizado;
      }
    }
  }

  const noPrazo = tarefas - atrasadas - implementadas;

  return {
    strategies: estrategias,
    tasks: tarefas,
    on_time: noPrazo,
    expired: atrasadas,
    finish: implementadas,
    percentage_on_time: (100 / tarefas) * noPrazo || 0,
    percentage_expired: (100 / tarefas) * atrasadas || 0,
    percentage_finish: (100 / tarefas) * implementadas || 0,
  };
};

module.exports.buscarDadosResumo = async (event, action) => {
  const { companyId, company } = action;

  const anos = await company.getExercises();
  const analise = {};

  await Promise.all(
    anos.map(async (ano) => {
      const result = await findResults(companyId, ano - 1);
      analise[ano] = parseSummary(result);
    })
  );

  await setLog(
    action,
    "success",
    "Carregando resumo para análise da eficiência"
  );

  return Handler.Ok({
    analise,
  });
};
