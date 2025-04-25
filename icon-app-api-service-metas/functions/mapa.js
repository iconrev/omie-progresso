const { middleware, ActionsClass } = require("../auth/authorizer");
const Objetivos = require("../services/mapas/objetivos");
const Estrategias = require("../services/mapas/estrategias");

const getService = (mapaId) => {
  const services = {
    objetivos: Objetivos,
    estrategias: Estrategias,
  };
  return services[mapaId];
};

const getAction = (event) => {
  const { mapaId } = event.pathParameters;
  const service = getService(mapaId);

  if (event.httpMethod === "GET") {
    return new ActionsClass(service.buscarDados, "", {
      allowDemo: true,
    });
  }

  if (event.httpMethod === "POST") {
    return new ActionsClass(service.salvarDados, "");
  }

  return null;
};

exports.main = (event, context, callback) => {
  const action = getAction(event);
  return middleware(event, context, callback, action);
};
