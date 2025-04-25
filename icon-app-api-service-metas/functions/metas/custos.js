const Custos = require("../../services/objetivos/Custo");
const { middleware, ActionsClass } = require("../../auth/authorizer");

const ACTIONS = {
  getDefinicao: new ActionsClass(Custos.orcamento_percentual_despesas, "", {
    allowDemo: true,
  }),
  postDefinicao: new ActionsClass(Custos.objetivo, ""),
};

const getAction = (event) => {
  if (event.httpMethod === "GET") {
    if (event.resource.includes("definicao")) {
      return ACTIONS.getDefinicao;
    }
  }

  if (event.httpMethod === "POST") {
    return ACTIONS.postDefinicao;
  }

  return null;
};

exports.main = async (event, context, callback) => {
  const action = getAction(event);
  return middleware(event, context, callback, action);
};
