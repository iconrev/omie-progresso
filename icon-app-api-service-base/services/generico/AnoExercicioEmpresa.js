const sequelize = require('sequelize');
const models = require('../../models');
const Empresa_Exercicios = models.Empresa_Exercicios;
const anoCorrente = (new Date().getFullYear()).toString()

/**
 * Recupera os anos de exerícios disponível para a empresa
 */
exports.getAll = async (companyId) => {

    let years = []

    let filter = {
        where: {
            EmpresaId: companyId
        }
    }
    await Empresa_Exercicios.findAll(filter)
        .then(response => {
            years = response
        })

    return years
}