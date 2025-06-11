const Gestao = require('./services/gestao');
const { middleware, ActionsClass } = require('./auth/authorizer');

module.exports.gestao_graficos = async (event, context, callback) => {

  const ACTIONS = {
    grafico_diagnostico: new ActionsClass(Gestao.grafico_diagnostico, 'grafico_diagnostico', { allowDemo: true }),
  }
  
  const getAction = (event) => {
    if (event.httpMethod === "GET") {
      return ACTIONS.grafico_diagnostico
    }
    return null;
  }

  const action = getAction(event);
  return middleware(event, context, callback, action)
}

