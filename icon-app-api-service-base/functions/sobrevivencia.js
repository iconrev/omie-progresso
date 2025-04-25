const Questionario = require("../services/diagnostico/sobrevivencia/questionario");
const { middleware, ActionsClass } = require("../auth/authorizer");

const ACTIONS = {
  grafico: new ActionsClass(
    Questionario.diagnostico_questionario_avaliacao,
    "diagnostic_survival_rate",
    { allowDemo: true }
  ),
  getTelaSobrevivencia: new ActionsClass(
    Questionario.diagnostic_survival_list,
    "diagnostic_survival_list",
    { allowDemo: true }
  ),
  postTelaSobrevivencia: new ActionsClass(
    Questionario.diagnostic_survival_update,
    "diagnostic_survival_update",
    { allowDemo: false }
  ),
};

const getAction = (event) => {
  if (event.httpMethod === "POST") {
    return ACTIONS.postTelaSobrevivencia;
  }

  if (event.httpMethod === "GET") {
    if (event.resource.includes("avaliacao")) {
      return ACTIONS.grafico;
    }
    return ACTIONS.getTelaSobrevivencia;
  }

  return null;
};

exports.main = async (event, context, callback) => {
  const action = getAction(event);
  return middleware(event, context, callback, action);
};
