'use strict'

const Receitas = require('../../services/objetivos/Receitas');

exports.main = (event, context, callback) => {
    if (event.httpMethod === 'GET') {
        if (event.resource.includes('analise')) {
            Receitas.analise(event, context, callback);
        }
        if(event.resource.includes('definicao')){
            Receitas.definicao_objetivos_receitas(event,context,callback);
        }
        if(event.resource.includes('gauge')){
            Receitas.grafico(event,context,callback);
        }
    } else if (event.httpMethod === 'POST') {
        if (event.resource.includes('avaliacao')) {
            Receitas.avaliacao(event, context, callback);
        }else {
            Receitas.criar(event, context, callback);
        }
    }
}