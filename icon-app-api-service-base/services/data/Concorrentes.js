'use strict';

const models = require('../../models');
const Concorrentes = models.Concorrentes;
const Concorrentes_Swot = models.Concorrentes_Swot;

/**
 * Setup
 */
exports.setup = async (empresa, ano) => {
  return new Promise(async (resolve, reject) => {

    const data = [
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        concorrente: 'CONCORRENTE 1',
        preco: '3',  // NÃO AVALIADO
        qualidade: '3',
        entrega: '3',
        inovacao: '3',
        portifolio: '3',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        concorrente: 'CONCORRENTE 2',
        preco: '3',
        qualidade: '3',
        entrega: '3',
        inovacao: '3',
        portifolio: '3',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        concorrente: 'CONCORRENTE 3',
        preco: '3',
        qualidade: '3',
        entrega: '3',
        inovacao: '3',
        portifolio: '3',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        concorrente: 'CONCORRENTE 4',
        preco: '3',
        qualidade: '3',
        entrega: '3',
        inovacao: '3',
        portifolio: '3',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        concorrente: 'CONCORRENTE 5',
        preco: '3',
        qualidade: '3',
        entrega: '3',
        inovacao: '3',
        portifolio: '3',
      },
    ];

    const swot = [
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        oportunidadeId: '-',
        ameacaId: '-',
        atratividade_da_oportunidade: '0',
        relevancia_da_ameaca: '0',
        probabilidade_de_sucesso_da_oportunidade: '0',
        probabilidade_de_ocorrer_a_ameaca: '0',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        oportunidadeId: '-',
        ameacaId: '-',
        atratividade_da_oportunidade: '0',
        relevancia_da_ameaca: '0',
        probabilidade_de_sucesso_da_oportunidade: '0',
        probabilidade_de_ocorrer_a_ameaca: '0',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        oportunidadeId: '-',
        ameacaId: '-',
        atratividade_da_oportunidade: '0',
        relevancia_da_ameaca: '0',
        probabilidade_de_sucesso_da_oportunidade: '0',
        probabilidade_de_ocorrer_a_ameaca: '0',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        oportunidadeId: '-',
        ameacaId: '-',
        atratividade_da_oportunidade: '0',
        relevancia_da_ameaca: '0',
        probabilidade_de_sucesso_da_oportunidade: '0',
        probabilidade_de_ocorrer_a_ameaca: '0',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        oportunidadeId: '-',
        ameacaId: '-',
        atratividade_da_oportunidade: '0',
        relevancia_da_ameaca: '0',
        probabilidade_de_sucesso_da_oportunidade: '0',
        probabilidade_de_ocorrer_a_ameaca: '0',
      },
    ];

    for (let i=0; i<data.length; i++) {
      const item = data[i]
      await Concorrentes.create(item)
          .then(result => {

          })
          .catch(err => {
            console.error(`Concorrente: erro adicionando concorrente ${item.concorrente}.`,);
          });
      const swotItem = swot[i]
      await Concorrentes_Swot.create(swotItem)
          .then(result => {

          })
          .catch(err => {
            console.error(`Concorrentes: erro adicionando SWOT concorrentes.`);
          });
    }

    console.log(`Concorrentes finalizado.`,);

    resolve(null);
  });
};
