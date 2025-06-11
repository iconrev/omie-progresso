'use strict';

const { TemplateService } = require('./TemplateService');
const models = require('../../../models');
const Macros = models.Macros;

const dataScope = {
  fator: '-',
  tendencia: '-',
  oportunidadeId: '-',
  ameacaId: '-',
  atratividade_da_oportunidade: '-',
  relevancia_da_ameaca: '-',
  probabilidade_de_sucesso_da_oportunidade: '-',
  probabilidade_de_ocorrer_a_ameaca: '-',
}

const data = Array.from({length: 5}, (v, k) => dataScope);

exports.setupData = async (empresa, ano) => {
  const service = new TemplateService(empresa, ano);
  await service.createTemplate(Macros, data);
}

exports.setup = async (empresa, ano) => {
  await this.setupData(empresa, ano);
};
