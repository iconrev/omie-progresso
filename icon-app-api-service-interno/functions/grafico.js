const AmbienteInterno = require('../services/diagnostico/interno/Avaliacao_amb_int');
const { middleware, ActionsClass } = require('../auth/authorizer');

const ACTIONS = {
  grafico: new ActionsClass(AmbienteInterno.avaliacao, 'diagnostic_internal_rate', { allowDemo: true }),
}

const getAction = (event) => {
  if (event.httpMethod === 'GET') {
    return ACTIONS.grafico
  }
  return null;
}

module.exports.main = async (event, context, callback) => {
  const action = getAction(event);
  return middleware(event, context, callback, action)
}