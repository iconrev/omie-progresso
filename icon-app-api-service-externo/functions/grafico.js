const Avaliacao_Ambiente_Externo = require('../services/diagnostico/externo/AvaliacaoAmbienteExterno');
const { middleware, ActionsClass } = require('../auth/authorizer');

const ACTIONS = {
  grafico: new ActionsClass(
    Avaliacao_Ambiente_Externo.diagnostico,
    'diagnostic_external_rate', { allowDemo: true }
  ),
}

const getAction = (event) => {
  if (event.httpMethod === 'GET') {
    return ACTIONS.grafico
  }
  return null;
}

module.exports.gestao_diagnostico = async (event, context, callback) => {
  const action = getAction(event);
  return middleware(event, context, callback, action)
}