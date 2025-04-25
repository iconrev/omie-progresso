const Fornecedores = require("../services/diagnostico/externo/Fonecedores");
const Fornecedores_Avaliacao = require("../services/diagnostico/externo/FornecedoresAvaliacao");
const { middleware, ActionsClass } = require("../auth/authorizer");

const ACTIONS = {
  grafico: {
    run: Fornecedores_Avaliacao.fornecedores_avaliacao,
    title: "diagnostic_external_providers_rate",
    allowDemo: true,
  },
  telaFornecedores: {
    run: Fornecedores.diagnostic_external_providers_list,
    title: "diagnostic_external_providers_list",
    allowDemo: true,
  },
  updateFornecedores: {
    run: Fornecedores.diagnostic_external_providers_update,
    title: "diagnostic_external_providers_update",
    allowDemo: false,
  },
  swot: {
    run: Fornecedores.diagnostic_external_providers_swot_list,
    title: "diagnostic_external_providers_swot_list",
    allowDemo: true,
  },
  swotUpdate: {
    run: Fornecedores.diagnostic_external_providers_swot_update,
    title: "diagnostic_external_providers_swot_update",
    allowDemo: false,
  },
};

const getAction = (event) => {
  if (event.httpMethod === "POST") {
    if (event.resource.includes("swot")) {
      return ACTIONS.swotUpdate;
    }
    return ACTIONS.updateFornecedores;
  }

  if (event.httpMethod === "GET") {
    if (event.resource.includes("swot")) {
      return ACTIONS.swot;
    }
    if (event.resource.includes("avaliacao")) {
      return ACTIONS.grafico;
    }
    return ACTIONS.telaFornecedores;
  }

  return null;
};

exports.main = async (event, context, callback) => {
  const action = getAction(event);
  const instance = new ActionsClass(action.run, action.title);
  instance.allowDemo = action.allowDemo;
  return middleware(event, context, callback, instance);
};
