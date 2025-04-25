const anoCorrente = (new Date().getFullYear()).toString()
const concorrentes = require('../diagnostico/data/Concorrentes');
const clientes = require('../diagnostico/data/clientes');
const fornecedores = require('../diagnostico/data/fornecedores');
const macros = require('../diagnostico/data/Macros');

const insertTemplate = async (companyId, year, resource) => {
    const resources = {
        Concorrentes: concorrentes,
        Clientes: clientes,
        Fornecedores: fornecedores,
        Macros: macros,
    }

    resource = resources[resource]

    if (resource) {
        await resource.setup(companyId, year)
    }
}

/**
 * Recupera todos os dados cadastrados da tabela
 */
const getAll = async (companyId, model, year) => {
    let filter = {
        where: {
            EmpresaId: companyId
        }
    }
    if (year) {
        filter['where']['ano_exercicio'] = year
    }

    let questionarios = []

    await model.findAll(filter)
        .then((response) => {
            if (response) {
                questionarios = response
            }
        })

    if (questionarios.length === 0 && year === anoCorrente) {
        let resource = model.tableName
        await insertTemplate(companyId, year, resource)
        questionarios = await getAll(companyId, model, year)
    }

    return questionarios
}

exports.getAll = getAll