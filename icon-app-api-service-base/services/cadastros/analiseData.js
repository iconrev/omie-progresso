'use strict'
const Analise_Data = require('../../core/models/analise_data');
module.exports.cadastro_analise_data =  (event, context, callback) => {

    context.callbackWaitsForEmptyEventLoop = false;

    // obtem os dados enviandos pelo client
    const { tipo } = event.queryStringParameters;

    console.log(`tipo ${tipo}`);

    switch (tipo) {
        case "Swot_Avaliacao":
            return callback(null, {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Analise_Data.Swot_Avaliacao)
            })
        case "Swot_Objetivos":
            return callback(null, {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Analise_Data.Swot_Objetivos)
            });
        case "Swot_Ameacas":
            return callback(null, {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Analise_Data.Swot_Ameacas)
            });
    }
    callback(null, {
        statusCode: 302,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            error: "client_error",
            error_description: "Lista de análise de data não definido."
        })
    });
}            
