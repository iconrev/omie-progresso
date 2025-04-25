const Integracao = require("../services/cadastros/integracao");
const { middleware, ActionsClass } = require("../auth/authorizer");

const ACTIONS = {
  importDREData: new ActionsClass(
    Integracao.importDREData,
    "company_import_dre",
    {
      allowDemo: false,
    }
  ),
};

const importDREAction = (event) => {
  if (event.httpMethod === "GET") {
    return ACTIONS.importDREData;
  }

  return null;
};

exports.import = async (event, context, callback) => {
  const action = importDREAction(event);
  return middleware(event, context, callback, action);
};
