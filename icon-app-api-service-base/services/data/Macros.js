'use strict';

const models = require('../../models');
const Macros = models.Macros;

/**
 * Setup
 */
exports.setup = async (empresa, ano) => {

  const data = {
    EmpresaId: empresa,
    ano_exercicio: ano,
    fator: '-',
    tendencia: '-',
    oportunidadeId: '-',
    ameacaId: '-',
    atratividade_da_oportunidade: '-',
    relevancia_da_ameaca: '-',
    probabilidade_de_sucesso_da_oportunidade: '-',
    probabilidade_de_ocorrer_a_ameaca: '-',
  }

  for (let i=0; i<5; i++) {
    await Macros.create(data)
        .then(result => {
          // console.info(`Macros: adicionado com sucesso.`,);
        })
        .catch(err => {
          console.error(`Macros: erro adicionando macro.`,);
        });
  }

  console.log(`Macro finalizado.`,);
};
