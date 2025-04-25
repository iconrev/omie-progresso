const models = require("../../models");
const { sequelize } = models;
const { QueryTypes } = require('sequelize');

module.exports.getDadosAnteriores = async (perspectiva, empresaId, ano_exercicio) => {
    console.info('Buscando dados anteriores...')

    let response;
    const tables = {
        'comercial': 'Vendas',
        'processos': 'Processos',
        'pessoas': 'Pessoas',
    }
    const table = tables[perspectiva]

    if (!table) {
        return response
    }

    let query = 'SELECT * FROM '+table+' WHERE EmpresaId = :EmpresaId and ano_exercicio = :ano_exercicio'
    let params = {
        replacements: {
            EmpresaId: empresaId,
            ano_exercicio: ano_exercicio,
        },
        type: QueryTypes.SELECT
    }

    await sequelize.query(query, params)
        .then(async (result) => {
            if (result) {
                response = result[0]
            }
        })
        .catch(err => {
            console.error(err)
        })

    return response
}