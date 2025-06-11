const Vendas = require("../services/diagnostico/interno/Comercial");
const { middleware, ActionsClass } = require("../auth/authorizer");

const ACTIONS = {
  grafico: new ActionsClass(
    Vendas.gauge,
    "diagnostic_internal_commercial_gauge",
    { allowDemo: true }
  ),
  getAvaliacao: new ActionsClass(
    Vendas.avaliacaoSmile,
    "diagnostic_internal_commercial_evaluation_load",
    { allowDemo: true }
  ),
  getDados: new ActionsClass(
    Vendas.editarVendas,
    "diagnostic_internal_commercial_data_load",
    { allowDemo: true }
  ),
  updateDados: new ActionsClass(
    Vendas.criarOuAtualizar,
    "diagnostic_internal_commercial_data_update"
  ),
  updateAvaliacao: new ActionsClass(
    Vendas.avaliacaoCriaOrAtualizar,
    "diagnostic_internal_commercial_evaluation_update"
  ),
  getComercialDetalhes: new ActionsClass(
    Vendas.vendas_detalhes,
    "getComercialDetalhes"
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
      return ACTIONS.getComercialDetalhes;
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
