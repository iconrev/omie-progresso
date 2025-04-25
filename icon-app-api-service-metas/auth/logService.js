const models = require("../models");

const env = process.env.NODE_ENV || "dev";

const STATUS = {
  success: "success",
  exception: "exception_error",
  unauthorized: "unauthorized",
};

const insertLog = async (action, status, log) => {
  const data = {
    id_usuario: action.user.id,
    context: action.companyId === null ? "" : action.companyId,
    action: action.title,
    log: String(log),
    status,
  };

  const consoleMesage = `[${data.status}] [${data.action}] ${data.log}`;
  // eslint-disable-next-line no-unused-expressions
  status === "success"
    ? console.info(consoleMesage)
    : console.warn(consoleMesage);

  if (!["prod-local", "qa-local"].includes(env)) {
    try {
      const { Usuario_Log } = models;
      await Usuario_Log.create(data, { raw: true });
    } catch (error) {
      console.error(error);
    }
  }
};

const setLog = async (action, status, log) => {
  await insertLog(action, status, log);
};

const setSuccessLog = async (action, log) => {
  await insertLog(action, STATUS.success, log);
};

const setLogUnauthorized = async (action) => {
  const log = `Usuário não possui permissões para ação`;
  await insertLog(action, STATUS.unauthorized, log);
};

const exceptionError = async (action, exception) => {
  console.error(exception.stack);
  await insertLog(action, STATUS.exception, exception.message);
};

module.exports = {
  setLog,
  exceptionError,
  setSuccessLog,
  setLogUnauthorized,
  STATUS,
};
