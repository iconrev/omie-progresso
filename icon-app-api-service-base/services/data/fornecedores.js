'use strict';

const models = require('../../models');
const Fornecedores = models.Fornecedores;
const Fornecedores_Swot = models.Fornecedores_Swot;

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
        fornecedor: 'FORNECEDOR 1',
        preco: '3', // NÃO AVALIADO
        qualidade: '3',
        entrega: '3',
        inovacao: '3',
        portifolio: '3',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        fornecedor: 'FORNECEDOR 2',
        preco: '3',
        qualidade: '3',
        entrega: '3',
        inovacao: '3',
        portifolio: '3',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        fornecedor: 'FORNECEDOR 3',
        preco: '3',
        qualidade: '3',
        entrega: '3',
        inovacao: '3',
        portifolio: '3',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        fornecedor: 'FORNECEDOR 4',
        preco: '3',
        qualidade: '3',
        entrega: '3',
        inovacao: '3',
        portifolio: '3',
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        fornecedor: 'FORNECEDOR 5',
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

    // fornecedores
    data.forEach(async item => {
      await Fornecedores.create(item)
        .then(result => {

        })
        .catch(err => {
          console.log(
            `Fornecedores: erro adicionando fornecedor ${item.fornecedor}.`,
          );
        });
    });

    // swot
    swot.forEach(async item => {
      await Fornecedores_Swot.create(item)
        .then(result => {
          console.log(
            // `Fornecedores: SWOT fornecedor adicionado com sucesso.`,
          );
        })
        .catch(err => {
          console.log(
            `Fornecedores: erro adicionando SWOT fornecedor.`,
          );
        });
    });

    console.log(`Fornecedores finalizado.`,);

    resolve(null);
  });
};
