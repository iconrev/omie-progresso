const Swot = require("../services/swot/Swot");
const { middleware, ActionsClass } = require("../auth/authorizer");

const ACTIONS = {
  swot: new ActionsClass(Swot.analise, "diagnostic_swot", { allowDemo: true }),
};

const getAction = (event) => {
  if (event.httpMethod === "GET") {
    return ACTIONS.swot;
  }

  return null;
};

exports.main = async (event, context, callback) => {
  const action = getAction(event);
  return middleware(event, context, callback, action);
};
