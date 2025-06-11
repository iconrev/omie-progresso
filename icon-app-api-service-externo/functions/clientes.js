const Clientes = require('../services/diagnostico/externo/Clientes');
const Clientes_Avaliacao = require('../services/diagnostico/externo/ClientesAvaliacao');
const { middleware, ActionsClass } = require('../auth/authorizer');

const ACTIONS = {
  grafico: {
    run: Clientes_Avaliacao.clientes_avaliacao,
    title: 'diagnostic_external_customers_rate',
    allowDemo: true,
  },
  telaClientes: {
    run: Clientes.diagnostic_external_customers_list,
    title: 'diagnostic_external_customers_list',
    allowDemo: true,
  },
  updateClientes: {
    run: Clientes.diagnostic_external_customers_update,
    title: 'diagnostic_external_customers_update',
    allowDemo: false,
  },
  swot: {
    run: Clientes.diagnostic_external_customers_swot_list,
    title: 'diagnostic_external_customers_swot_list',
    allowDemo: true,
  },
  swotUpdate: {
    run: Clientes.diagnostic_external_customers_swot_update,
    title: 'diagnostic_external_customers_swot_update',
    allowDemo: false,
  },
}

const getAction = (event) => {
  if (event.httpMethod === 'POST') {
    if (event.resource.includes('swot')) {
      return ACTIONS.swotUpdate
    } else {
      return ACTIONS.updateClientes
    }
  }

  if (event.httpMethod === 'GET') {
    if (event.resource.includes('swot')) {
      return ACTIONS.swot
    } else if (event.resource.includes('avaliacao')) {
      return ACTIONS.grafico
    } else {
      return ACTIONS.telaClientes
    }
  }

  return null;
}

exports.main = async (event, context, callback) => {
  const action = getAction(event);
  const instance = new ActionsClass(
    action.run,
    action.title
  )
  instance.allowDemo = action.allowDemo;
  return middleware(event, context, callback, instance)
}