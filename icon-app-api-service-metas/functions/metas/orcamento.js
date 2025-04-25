const Orcamento = require("../../services/objetivos/Orcamento");
const { middleware, ActionsClass } = require("../../auth/authorizer");

const ACTIONS = {
  getDefinicao: new ActionsClass(Orcamento.orcamento_mensal, "", {
    allowDemo: true,
  }),
  postDefinicao: new ActionsClass(Orcamento.salvarOrcamento, ""),
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
