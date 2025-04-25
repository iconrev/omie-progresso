'use strict';
const models = require('../../../models');
const { DiagnosticoExternoAvaliacao } = models;

module.exports.diagnostico = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    const { companyId } = event.pathParameters;
    DiagnosticoExternoAvaliacao.findAll({ where: { EmpresaId: companyId } }).then(result => {
        const response = {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                avaliacao: result
            })
        }
        callback(null, response)
    }
    ).catch(err => {
        const response = {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: "client_error",
                error_description: err
            })
        };
        callback(null, response);
    });
}