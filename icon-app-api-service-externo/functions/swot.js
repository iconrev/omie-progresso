const Swot = require("../services/diagnostico/externo/Swot");
const { middleware, ActionsClass } = require('../auth/authorizer');


const ACTIONS = {
  tabela: new ActionsClass(
    Swot.tabela,
    'tabela', {
    allowDemo: true,
  }
  ),
  criarOpcao: new ActionsClass(
    Swot.criar_tabela_swot_opcao,
    "criar_tabela_swot_opcao", {
    allowDemo: false,
  }),
  atualizarOpcao: new ActionsClass(
    Swot.atualizar_tabela_swot_opcao,
    "atualizar_tabela_swot_opcao", {
    allowDemo: false,
  }),
  deletarOpcao: new ActionsClass(
    Swot.deletar_tabela_swot_opcao,
    "deletar_tabela_swot_opcao", {
    allowDemo: false,
  }),
};

const getSwotAction = (event) => {
  if (event.httpMethod === "GET") return ACTIONS.tabela;
  if (event.httpMethod === "POST") return ACTIONS.criarOpcao;
  // if (event.httpMethod === "PUT") return ACTIONS.atualizarOpcao;
  // if (event.httpMethod === "DELETE") return ACTIONS.deletarOpcao;
  return null;
};

exports.main = async (event, context, callback) => {
  const action = getSwotAction(event);
  return middleware(event, context, callback, action);
};
