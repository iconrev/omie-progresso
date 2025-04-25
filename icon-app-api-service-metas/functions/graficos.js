const Graficos = require("../services/Graficos");
const Gauge = require("../services/diretrizes/Gauge");
const { middleware, ActionsClass } = require("../auth/authorizer");

const ACTIONS = {
  graficoMetas: new ActionsClass(Graficos.CarregarGraficos, "grafico_metas", {
    allowDemo: true,
  }),
  graficoDiretrizes: new ActionsClass(
    Gauge.buscarDadosGraficoEstrategias,
    "grafico_diretrizes",
    {
      allowDemo: true,
    }
  ),
};

const getAction = (event) => {
  if (event.httpMethod === "GET") {
    if (event.path.includes("/metas/grafico")) {
      return ACTIONS.graficoMetas;
    }
    if (event.path.includes("/diretrizes/grafico")) {
      return ACTIONS.graficoDiretrizes;
    }
  }
  return null;
};

module.exports.main = async (event, context, callback) => {
  console.info("buscando gráficos do hub");
  console.info(event);
  const action = getAction(event);
  return middleware(event, context, callback, action);
};
