'use strict';

const models = require('../../models');
const Clientes = models.Clientes;
const Clientes_Swot = models.Clientes_Swot;

/**
 * Setup
 */
exports.setup = async (empresa, ano) => {
  return new Promise((resolve, reject) => {
    const createResult = [];
    // conteúdo
    const data = [
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        cliente: 'CLIENTE 1',
        preco: '3', // 3-NÃO AVALIADO
        qualidade: '3',
        entrega: '3',
        inovacao: '3',
        portifolio: '3',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        cliente: 'CLIENTE 2',
        preco: '3',
        qualidade: '3',
        entrega: '3',
        inovacao: '3',
        portifolio: '3',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        cliente: 'CLIENTE 3',
        preco: '3',
        qualidade: '3',
        entrega: '3',
        inovacao: '3',
        portifolio: '3',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        cliente: 'CLIENTE 4',
        preco: '3',
        qualidade: '3',
        entrega: '3',
        inovacao: '3',
        portifolio: '3',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        cliente: 'CLIENTE 5',
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

    data.forEach(async item => {
      Clientes.create(item)
        .then(result => {

        })
        .catch(err => {
          console.log(
            `Clientes: erro adicionando cliente ${item.cliente}.`,
          );
        });
    });

    swot.forEach(async item => {
      await Clientes_Swot.create(item)
        .catch(err => {
          console.log(`Clientes: erro adicionando SWOT clientes.`);
        });
    });

    console.log(`Clientes finalizado.`,);

    resolve(null);
  });
};
