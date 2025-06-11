const DRE = require("../services/diagnostico/interno/dre");
const { middleware, ActionsClass } = require("../auth/authorizer");

const ACTIONS = {
  grafico: new ActionsClass(DRE.gauge, "diagnostic_internal_financial_gauge", {
    allowDemo: true,
  }),
  getAvaliacao: new ActionsClass(
    DRE.diagnostico_analise_desempenho_financeiro,
    "diagnostic_internal_financial_evaluation_load",
    { allowDemo: true }
  ),
  updateAvaliacao: new ActionsClass(
    DRE.diagnostic_internal_financial_evaluation_update,
    "diagnostic_internal_financial_evaluation_update"
  ),
  getDados: new ActionsClass(
    DRE.dados,
    "diagnostic_internal_financial_data_load",
    { allowDemo: true }
  ),
  updateDados: new ActionsClass(
    DRE.update_data,
    "diagnostic_internal_financial_data_update"
  ),
  updateCategoria: new ActionsClass(
    DRE.update_expense_category,
    "diagnostic_internal_financial_data_update_expense_category"
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
  }

  if (event.httpMethod === "POST") {
    if (event.resource.includes("avaliacao")) {
      return ACTIONS.updateAvaliacao;
    }
    if (event.resource.includes("dados")) {
      return ACTIONS.updateDados;
    }
  }

  if (event.httpMethod === "PUT") {
    if (event.resource.includes("categoria")) {
      return ACTIONS.updateCategoria;
    }
  }

  return null;
};

exports.main = async (event, context, callback) => {
  const action = getAction(event);
  return middleware(event, context, callback, action);
};
