const { QueryTypes } = require('sequelize');
const models = require("../../models");
const { Diretrizes_Tarefas } = models;
const { sequelize } = models;

module.exports.getTasksByStrategyId = async (id_strategy, fields=undefined) => {

    let response = []

    const filter = {
        where: {
            estrategia_id: id_strategy
        },
        raw: true
    }

    if (fields) {
        filter['attributes'] = fields
    }

    await Diretrizes_Tarefas.findAll(filter)
        .then(result => {
            response = result
        })
        .catch(err => {
            console.error(err)
        })

    return response
};

module.exports.getStatusTasksByStrategyId = async (id_strategy) => {

    let response = {
        aguardando: 0,
        executando: 0,
        realizado: 0,
    }

    let query = 'SELECT  stage, count(id) as total ' +
        'FROM Diretrizes_Tarefas ' +
        'where estrategia_id = :estrategia_id ' +
        'group by 1 order by stage'
    let params = {
        replacements: {
            estrategia_id: id_strategy,
        },
        type: QueryTypes.SELECT
    }

    await sequelize.query(query, params)
        .then(async (result) => {
            if (result) {
                for (const item of result) {
                    response[item.stage] = item.total
                }
            }
        })
        .catch(err => {
            console.error(err)
        })

    return response
}

module.exports.getExpiredTasksByStrategyId = async (id_strategy) => {

    let response = 0

    let query = 'SELECT  count(id) as expired ' +
        'FROM Diretrizes_Tarefas ' +
        'where estrategia_id = :estrategia_id and expiration_date < date(now()) '+
        'and stage != "realizado"'
    let params = {
        replacements: {
            estrategia_id: id_strategy,
        },
        type: QueryTypes.SELECT
    }

    await sequelize.query(query, params)
        .then(async (result) => {
            if (result) {
                for (const item of result) {
                    response = item.expired
                }
            }
        })
        .catch(err => {
            console.error(err)
        })

    return response
}