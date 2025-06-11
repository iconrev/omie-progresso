'use strict';

const { TemplateService } = require('./TemplateService');
const models = require('../../../models');
const Concorrentes = models.Concorrentes;
const Concorrentes_Swot = models.Concorrentes_Swot;

const data = [
  {
    concorrente: 'CONCORRENTE 1',
    preco: '3',  // NÃO AVALIADO
    qualidade: '3',
    entrega: '3',
    inovacao: '3',
    portifolio: '3',
  },
  {
    concorrente: 'CONCORRENTE 2',
    preco: '3',
    qualidade: '3',
    entrega: '3',
    inovacao: '3',
    portifolio: '3',
  },
  {
    concorrente: 'CONCORRENTE 3',
    preco: '3',
    qualidade: '3',
    entrega: '3',
    inovacao: '3',
    portifolio: '3',
  },
  {
    concorrente: 'CONCORRENTE 4',
    preco: '3',
    qualidade: '3',
    entrega: '3',
    inovacao: '3',
    portifolio: '3',
  },
  {
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
  await service.createTemplate(Concorrentes, data);
}

exports.setupSwot = async (empresa, ano) => {
  const service = new TemplateService(empresa, ano);
  await service.createTemplate(Concorrentes_Swot, swot,);
}

exports.setup = async (empresa, ano) => {
  await this.setupData(empresa, ano);
  await this.setupSwot(empresa, ano);
};
