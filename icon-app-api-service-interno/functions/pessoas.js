const Pessoas = require('../services/diagnostico/interno/Pessoas');
const { middleware, ActionsClass } = require('../auth/authorizer');

const ACTIONS = {
  grafico: new ActionsClass(Pessoas.gauge, 'diagnostic_internal_people_gauge', { allowDemo: true }),
  getAvaliacao: new ActionsClass(Pessoas.obter_dados_avaliacao, 'diagnostic_internal_people_evaluation_load', { allowDemo: true }),
  getDados: new ActionsClass(Pessoas.editar_pessoas, 'diagnostic_internal_people_data_load', { allowDemo: true }),
  updateDados: new ActionsClass(Pessoas.salvar_pessoas, 'diagnostic_internal_people_data_update'),
  updateAvaliacao: new ActionsClass(Pessoas.salvar_avaliacao, 'diagnostic_internal_people_evaluation_update'),
  getPessoasDetalhes: new ActionsClass(Pessoas.pessoas_detalhes, 'getPessoasDetalhes'),
}

const getAction = (event) => {
  if (event.httpMethod === "GET") {
    if (event.resource.includes("gauge")) {
      return ACTIONS.grafico
    }
    if (event.resource.includes('avaliacao')) {
      return ACTIONS.getAvaliacao;
    }
    if (event.resource.includes('dados')) {
      return ACTIONS.getDados;
    }
    if (event.resource.includes("detalhes")) {
      return ACTIONS.getPessoasDetalhes;
    }
  }

  if (event.httpMethod === "POST") {
    if (event.resource.includes('avaliacao')) {
      return ACTIONS.updateAvaliacao
    }
    if (event.resource.includes('dados')) {
      return ACTIONS.updateDados;
    }
  }

  return null
}

exports.main = async (event, context, callback) => {
  const action = getAction(event);
  return middleware(event, context, callback, action)
}