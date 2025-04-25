'use strict';

const Rentabilidade = require('../../services/objetivos/Rentabilidade');

exports.main = (event, context, callback) => {
    if (event.httpMethod === 'GET') {
        if (event.resource.includes('analise')) {
            Rentabilidade.analise(event, context, callback);
        }
        if(event.resource.includes("definicao")){
            Rentabilidade.definicao_objetivo_rentabilidade(event, context, callback);
        }
    } else if (event.httpMethod === 'POST') {
        Rentabilidade.criar(event, context, callback);
    }
};
