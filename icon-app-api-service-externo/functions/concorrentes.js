const Concorrentes = require("../services/diagnostico/externo/Concorrentes");
const Concorrentes_Avaliacao = require("../services/diagnostico/externo/ConcorrentesAvaliacao");
const { middleware, ActionsClass } = require("../auth/authorizer");

const ACTIONS = {
  grafico: {
    run: Concorrentes_Avaliacao.concorrentes_avaliacao_grafico,
    title: "diagnostic_external_rival_rate",
    allowDemo: true,
  },
  telaConcorrentes: {
    run: Concorrentes.diagnostic_external_rival_list,
    title: "diagnostic_external_rival_list",
    allowDemo: true,
  },
  updateConcorrentes: {
    run: Concorrentes.diagnostic_external_rival_update,
    title: "diagnostic_external_rival_update",
    allowDemo: false,
  },
  swot: {
    run: Concorrentes.diagnostic_external_rival_swot_list,
    title: "diagnostic_external_rival_swot_list",
    allowDemo: true,
  },
  swotUpdate: {
    run: Concorrentes.diagnostic_external_rival_swot_update,
    title: "diagnostic_external_rival_swot_update",
    allowDemo: false,
  },
};

const getAction = (event) => {
  if (event.httpMethod === "POST") {
    if (event.resource.includes("swot")) {
      return ACTIONS.swotUpdate;
    }
    return ACTIONS.updateConcorrentes;
  }

  if (event.httpMethod === "GET") {
    if (event.resource.includes("swot")) {
      return ACTIONS.swot;
    }
    if (event.resource.includes("avaliacao")) {
      return ACTIONS.grafico;
    }
    return ACTIONS.telaConcorrentes;
  }

  return null;
};

exports.main = async (event, context, callback) => {
  const action = getAction(event);
  const instance = new ActionsClass(action.run, action.title);
  instance.allowDemo = action.allowDemo;
  return middleware(event, context, callback, instance);
};
