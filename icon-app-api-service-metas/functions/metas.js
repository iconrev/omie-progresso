const { middleware, ActionsClass } = require("../auth/authorizer");
const Comercial = require("../services/Comercial");
const Processos = require("../services/Processos");
const Pessoas = require("../services/Pessoas");

const getPerspectiva = (path) => {
  const regex = /\/metas\/(.*)\/\{categoria\}\//;
  try {
    const perspectiva = path.match(regex)[1];
    return perspectiva;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const getService = (perspectiva) => {
  const services = {
    comercial: Comercial,
    processos: Processos,
    pessoas: Pessoas,
  };
  return services[perspectiva];
};

const getAction = (event) => {
  const perspectiva = getPerspectiva(event.resource);
  // eslint-disable-next-line no-param-reassign
  event.pathParameters.perspectiva = perspectiva;

  const Service = getService(perspectiva);

  if (event.httpMethod === "GET") {
    if (event.resource.includes("definicao")) {
      return new ActionsClass(Service.definicao, "", {
        allowDemo: true,
      });
    }
  }

  if (event.httpMethod === "POST") {
    return new ActionsClass(Service.salvarMeta, "");
  }

  return null;
};

exports.main = (event, context, callback) => {
  const action = getAction(event);
  return middleware(event, context, callback, action);
};
