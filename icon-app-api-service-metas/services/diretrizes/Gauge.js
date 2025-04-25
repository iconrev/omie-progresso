const Handler = require("../handler");
const controllerEstrategias = require("../generico/FuncoesDeEstrategias");
const controllerTarefas = require("../generico/FuncoesDeTarefas");
const GetModel = require("../generico/GetModel");
const {
  gaugeDiretrizesEficacia,
  gaugeDiretrizesPreenchimento,
} = require("./Eficacia");

module.exports.buscarDadosGraficoEstrategias = async (event, action) => {
  console.info("carregar graficos de diretrizes");

  const { company, companyId } = action;
  const allModels = GetModel.allCategory();
  const perspectivas = Object.keys(allModels);
  const anos = await company.getExercises();
  const analise = {};

  const run = async (ano) => {
    let estrategiasAno = [];

    let tasks = 0;
    let expired_tasks = 0;
    let open_tasks = 0;

    const runPerspectiva = async (perspectiva) => {
      const foreignKeyName = allModels[perspectiva].foreignKey.idName;
      const foreignKeyTable = allModels[perspectiva].foreignKey.table;
      const tableEstrategia = allModels[perspectiva].estrategias;
      const foreignKeyId = await controllerEstrategias.getForeignKeyIdByYear(
        ano - 1,
        companyId,
        foreignKeyTable
      );
      if (!foreignKeyId) {
        return;
      }
      const estrategiasPerspectiva =
        await controllerEstrategias.getStrategyByForeignKeyId(
          foreignKeyId.id,
          foreignKeyName,
          tableEstrategia
        );
      if (!estrategiasPerspectiva) {
        return;
      }
      estrategiasAno = estrategiasAno.concat(estrategiasPerspectiva);
    };

    const runEstrategia = async (estrategia) => {
      const { aguardando, executando, realizado } =
        await controllerTarefas.getStatusTasksByStrategyId(estrategia.id);
      const tasksEstrategia = aguardando + executando + realizado;
      tasks += tasksEstrategia;
      if (tasksEstrategia > 0) {
        expired_tasks += await controllerTarefas.getExpiredTasksByStrategyId(
          estrategia.id
        );
        open_tasks += aguardando + executando;
      }
    };

    await Promise.all(
      perspectivas.map((perspectiva) => runPerspectiva(perspectiva))
    );

    await Promise.all(
      estrategiasAno.map((estrategia) => runEstrategia(estrategia))
    );

    const expired_tasks_percentage = (expired_tasks / tasks) * 100 || 0.0;
    const on_time_tasks_percentage = (1 - expired_tasks / tasks) * 100 || 0.0;

    const nivel_prenchimento = await gaugeDiretrizesPreenchimento(
      companyId,
      ano
    );
    const eficacia =
      nivel_prenchimento > 0 ? await gaugeDiretrizesEficacia(company, ano) : 0;

    analise[ano] = {
      tasks,
      expired_tasks,
      expired_tasks_percentage: parseInt(
        expired_tasks_percentage.toFixed(),
        10
      ),
      on_time_tasks_percentage: parseInt(
        on_time_tasks_percentage.toFixed(),
        10
      ),
      open_tasks,
      completed_tasks: tasks - open_tasks,
      nivel_prenchimento,
      eficacia,
    };
  };

  const promises = anos.map((ano) => run(ano));
  await Promise.all(promises);

  return Handler.Ok({
    analise,
  });
};
