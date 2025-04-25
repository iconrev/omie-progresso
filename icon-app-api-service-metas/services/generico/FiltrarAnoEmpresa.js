const sequelize = require('sequelize');

/**
 * Recupera o ano, cujo qual há lançamentos
 */
exports.ultimo_ano_exercicio = (model, empresa) => {
    return new Promise(async (resolve, reject) => {
        await model.findAll({
            where: { EmpresaId: empresa },
            attributes: [[sequelize.fn('max', sequelize.col('ano_exercicio')), 'ano_exercicio']],
            raw: true
        }).then(ano => {
            if (ano) {
                resolve(ano[0].ano_exercicio);
            } else {
                resolve(0);
            }
        }).catch(err => reject(0));
    });
}