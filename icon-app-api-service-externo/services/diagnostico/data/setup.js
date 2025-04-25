'use strict';

const concorrentes = require('../data/Concorrentes');
const clientes = require('../data/clientes');
const fornecedores = require('../data/fornecedores');
const macros = require('../data/Macros');
const questionario = require('../data/Questionario');

const Handler = require('../handler');

/**
 * Setup
 */
exports.setup = async (event, context, callback, companyId = null, year = null, api = false,) => {

  context.callbackWaitsForEmptyEventLoop = false;

  if (companyId) {
    // não faz nada...
  } else {
    const { companyId } = event.pathParameters;
  }

  // recursos que serão utilizados, ambiente externo
  const resources = [
    concorrentes, clientes, fornecedores, macros, questionario
  ]

  try {
    resources.forEach(async (item) => {
      await item
        .setup(companyId, year)
        .then(result => {
          //
        })
        .catch(err => {
          console.log(`Erro adicionando dados default da empresa ${companyId}`);
        });
    });

    if (api) {
      return Handler.Ok({
        status: 'DONE',
        messeg: `Setup concluido, verifique logs no Servidor...`,
      });
    }

  } catch (error) {
    console.log(error)
    if (api) {
      return Handler.Fail({
        messeg: `Erro executando instrução no servidor`,
      });
    }
  }
};
