'use strict';

const Custos = require('../../services/objetivos/Custo');
const Handler = require('../../services/handler');

exports.main = (event, context, callback) => {
  if (event.resource.includes('distribuicao')) {
    if (event.httpMethod.includes('POST')) {
      Custos.objetivo(event, context, callback);
    } else {
      if (event.resource.includes('anual')) {
        Custos.orcamento_mensal_anual(event, context, callback);
      }else{
        Custos.orcamento_percentual_despesas(event, context, callback);
      }
    }
  }else{
    return Handler.Error({
      message:`Path not found ${event.resource}`
    })
  }
};
