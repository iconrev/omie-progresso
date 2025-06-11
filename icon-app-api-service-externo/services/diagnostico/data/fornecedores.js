'use strict';

const { TemplateService } = require('./TemplateService');
const models = require('../../../models');
const Fornecedores = models.Fornecedores;
const Fornecedores_Swot = models.Fornecedores_Swot;

const data = [
  {
    fornecedor: 'FORNECEDOR 1',
    preco: '3', // NÃO AVALIADO
    qualidade: '3',
    entrega: '3',
    inovacao: '3',
    portifolio: '3',
  },
  {
    fornecedor: 'FORNECEDOR 2',
    preco: '3',
    qualidade: '3',
    entrega: '3',
    inovacao: '3',
    portifolio: '3',
  },
  {
    fornecedor: 'FORNECEDOR 3',
    preco: '3',
    qualidade: '3',
    entrega: '3',
    inovacao: '3',
    portifolio: '3',
  },
  {
    fornecedor: 'FORNECEDOR 4',
    preco: '3',
    qualidade: '3',
    entrega: '3',
    inovacao: '3',
    portifolio: '3',
  },
  {
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
    oportunidadeId: '-',
    ameacaId: '-',
    atratividade_da_oportunidade: '-',
    relevancia_da_ameaca: '-',
    probabilidade_de_sucesso_da_oportunidade: '-',
    probabilidade_de_ocorrer_a_ameaca: '-',
  },
  {
    oportunidadeId: '-',
    ameacaId: '-',
    atratividade_da_oportunidade: '-',
    relevancia_da_ameaca: '-',
    probabilidade_de_sucesso_da_oportunidade: '-',
    probabilidade_de_ocorrer_a_ameaca: '-',
  },
  {
    oportunidadeId: '-',
    ameacaId: '-',
    atratividade_da_oportunidade: '-',
    relevancia_da_ameaca: '-',
    probabilidade_de_sucesso_da_oportunidade: '-',
    probabilidade_de_ocorrer_a_ameaca: '-',
  },
  {
    oportunidadeId: '-',
    ameacaId: '-',
    atratividade_da_oportunidade: '-',
    relevancia_da_ameaca: '-',
    probabilidade_de_sucesso_da_oportunidade: '-',
    probabilidade_de_ocorrer_a_ameaca: '-',
  },
  {
    oportunidadeId: '-',
    ameacaId: '-',
    atratividade_da_oportunidade: '-',
    relevancia_da_ameaca: '-',
    probabilidade_de_sucesso_da_oportunidade: '-',
    probabilidade_de_ocorrer_a_ameaca: '-',
  },
];

exports.setupData = async (empresa, ano) => {
  const service = new TemplateService(empresa, ano);
  await service.createTemplate(Fornecedores, data);
}

exports.setupSwot = async (empresa, ano) => {
  const service = new TemplateService(empresa, ano);
  await service.createTemplate(Fornecedores_Swot, swot,);
}

exports.setup = async (empresa, ano) => {
  await this.setupData(empresa, ano);
  await this.setupSwot(empresa, ano);
};
