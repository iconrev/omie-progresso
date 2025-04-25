'use strict';

const concorrentes = require('../data/Concorrentes');
const clientes = require('../data/clientes');
const fornecedores = require('../data/fornecedores');
const macros = require('../data/Macros');
const questionario = require('../data/Questionario');


exports.setup = async (companyId, year) => {

  try {

    console.info(`Iniciando setup default da empresa ${companyId}`);

    const resources = [
      concorrentes.setup(companyId, year),
      clientes.setup(companyId, year),
      fornecedores.setup(companyId, year),
      macros.setup(companyId, year),
      questionario.setup(companyId, year),
    ]

    await Promise.all(resources);

    console.info(`Setup da Empresa ${companyId} efetuado com sucesso.`);

  } catch (error) {
    console.log(error)
  }
};
