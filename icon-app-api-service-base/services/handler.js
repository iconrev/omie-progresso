const Logger = require("../auth/logService");
const userController = require("../auth/userController");

const headersDefault = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

const response = (statusCode, statusMessage, body, headers) => ({
  statusCode,
  headers: {
    ...headersDefault,
    ...headers,
  },
  body: JSON.stringify({
    status: statusMessage,
    ...body,
  }),
});

module.exports.Ok = (body = {}, headers = {}) =>
  response(200, "success", body, headers);

module.exports.Created = (body = {}, headers = {}) =>
  response(201, "success", body, headers);

module.exports.Error = (body = {}, headers = {}) =>
  response(500, "fatal_error", body, headers);

module.exports.Fail = (body = {}, headers = {}) =>
  response(400, "fail", body, headers);

module.exports.Unauthenticated = (body = {}, headers = {}) =>
  response(
    401,
    "unauthenticated",
    { message: "Usuário não autenticado", ...body },
    headers
  );

module.exports.BadRequest = (body = {}, headers = {}) =>
  response(400, "bad_request", body, headers);

module.exports.NotFound = (body = {}, headers = {}) =>
  response(404, "not_found", body, headers);

module.exports.Forbidden = (body = {}, headers = {}) =>
  response(403, "forbidden", body, headers);

module.exports.Exception = async (action, exception, body = {}) => {
  try {
    await Logger.exceptionError(action, exception);
  } catch (error) {
    console.error("Não foi possível inserir log de exceção");
    console.error(error);
  }
  body = {
    message: "Erro ao executar instruções no servidor.",
    ...body,
  };
  try {
    const isAdm = await userController.validateProfile(action.user.id, [
      "superadmin",
      "admin",
    ]);
    if (isAdm) {
      body.exception = exception.message;
      body.stack = exception.stack.split('\n');
    }
  } catch (error) {
    console.error("Não foi possível validar perfil do usuário");
    console.error(error);
  }

  return response(500, Logger.STATUS.exception, body, {});
};

module.exports.Unauthorized = async (
  action,
  body = {},
  headers = {},
  setLog = true
) => {
  if (setLog) await Logger.setLogUnauthorized(action);
  body = {
    message: "Usuário não autorizado",
    ...body,
  };
  return response(401, "unauthorized", body, headers);
};
