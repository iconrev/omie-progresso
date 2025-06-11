const Macro = require('../services/diagnostico/externo/Macro');
const Macro_Avaliacao = require('../services/diagnostico/externo/MacroAvaliacao');
const { middleware, ActionsClass } = require('../auth/authorizer');

const ACTIONS = {
  grafico: {
    run: Macro_Avaliacao.macro_avaliacao,
    title: 'diagnostic_external_macro_rate',
    allowDemo: true,
  },
  telaMacro: {
    run: Macro.diagnostic_external_macro_list,
    title: 'diagnostic_external_macro_list',
    allowDemo: true,
  },
  updateMacro: {
    run: Macro.diagnostic_external_macro_swot_update,
    title: 'diagnostic_external_macro_swot_update',
    allowDemo: false,
  }
}

const getAction = (event) => {
  if (event.httpMethod === 'POST') {
    return ACTIONS.updateMacro
  }

  if (event.resource.includes('avaliacao')) {
    return ACTIONS.grafico
  } else {
    return ACTIONS.telaMacro
  }
  
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