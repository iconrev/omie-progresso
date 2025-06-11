const models = require('../../models');
const Dre = models.Empresa_Exercicios;


exports.byYear = async (companyId, year) => {

    return new Promise(async (resolve, reject) => {
        await Dre.findOne({
            where: {
                EmpresaId: companyId,
                ano_exercicio: year
            },
            raw: true,
        })
            .then(dre => resolve(dre))
            .catch(err => reject(err));
    });

}