const Integracao = require("../services/cadastros/integracao");
const { middleware, ActionsClass } = require("../auth/authorizer");

const ACTIONS = {
  postKeys: new ActionsClass(Integracao.postKeys, "company_post_keys", {
    allowDemo: false,
  }),
  getKeys: new ActionsClass(Integracao.getKeys, "company_get_keys", {
    allowDemo: false,
  }),
};

const getKeysAction = (event) => {
  if (event.httpMethod === "POST") {
    return ACTIONS.postKeys;
  }

  if (event.httpMethod === "GET") {
    return ACTIONS.getKeys;
  }

  return null;
};

exports.omie = async (event, context, callback) => {
  const action = getKeysAction(event);
  return middleware(event, context, callback, action);
};
