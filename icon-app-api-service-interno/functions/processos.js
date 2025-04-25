const Processos = require("../services/diagnostico/interno/Processos");
const { middleware, ActionsClass } = require("../auth/authorizer");

const ACTIONS = {
  grafico: new ActionsClass(
    Processos.gauge,
    "diagnostic_internal_processes_gauge",
    { allowDemo: true }
  ),
  getAvaliacao: new ActionsClass(
    Processos.processoSmile,
    "diagnostic_internal_processes_evaluation_load",
    { allowDemo: true }
  ),
  getDados: new ActionsClass(
    Processos.editarProcessos,
    "diagnostic_internal_processes_data_load",
    { allowDemo: true }
  ),
  updateDados: new ActionsClass(
    Processos.edicaoCriarOuAtualizar,
    "diagnostic_internal_processes_data_update"
  ),
  updateAvaliacao: new ActionsClass(
    Processos.smileCriarOuAtualizar,
    "diagnostic_internal_processes_evaluation_update"
  ),
  getProcessosDetalhes: new ActionsClass(
    Processos.processo_detalhes,
    "getProcessosDetalhes"
  ),
};

const getAction = (event) => {
  if (event.httpMethod === "GET") {
    if (event.resource.includes("gauge")) {
      return ACTIONS.grafico;
    }
    if (event.resource.includes("avaliacao")) {
      return ACTIONS.getAvaliacao;
    }
    if (event.resource.includes("dados")) {
      return ACTIONS.getDados;
    }
    if (event.resource.includes("detalhes")) {
      return ACTIONS.getProcessosDetalhes;
    }
  }

  if (event.httpMethod === "POST") {
    if (event.resource.includes("avaliacao")) {
      return ACTIONS.updateAvaliacao;
    }
    if (event.resource.includes("dados")) {
      return ACTIONS.updateDados;
    }
  }

  return null;
};

exports.main = async (event, context, callback) => {
  const action = getAction(event);
  return middleware(event, context, callback, action);
};
