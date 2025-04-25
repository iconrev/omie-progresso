'use strict';

// const Empresas = require('../../models/Empresas');
const models = require('../../models');
const Categoria = models.Dre_Categoria;

/**
 * CADASTROS|CATEGORIA|POST
 * Regra responsável por incluir as informações referente a categorias.
 */
module.exports.categoria_registro = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    // obtem os dados enviandos pelo client
    const {
        descricao,
        tipo } = JSON.parse(event.body);

    // cria novo registro no banco de dados
    Categoria.create({descricao, tipo}).then(result => {
        const response = {
            statusCode: 302,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result)
        }
        callback(null, response)
    }).catch(err => {
        const response = {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: "client_error",
                error_description: err
            })
        }
        callback(null, response)
    });
}
/**
 * CADASTRO|CATEGORIA|LIST
 * Regra responsável por listar as informações referente categoria.
 */
module.exports.categoria_list = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let condition = {}
    if(event.queryStringParameters){
        const {tipo} = event.queryStringParameters;
        condition = {
            tipo: tipo
        }
    }
    // cria novo registro no banco de dados
    Categoria.findAll({where: condition}).then(result => {
        const response = {
            statusCode: 302,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result)
        }
        callback(null, response)
    }).catch(err => {
        const response = {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: "client_error",
                error_description: err
            })
        }
        callback(null, response)
    });
}