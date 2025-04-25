const { TemplateService } = require("./TemplateService");
const models = require("../../../models");

const { Clientes } = models;
const { Clientes_Swot } = models;

const data = [
  {
    cliente: "CLIENTE 1",
    preco: "3", // 3-NÃO AVALIADO
    qualidade: "3",
    entrega: "3",
    inovacao: "3",
    portifolio: "3",
  },
  {
    cliente: "CLIENTE 2",
    preco: "3",
    qualidade: "3",
    entrega: "3",
    inovacao: "3",
    portifolio: "3",
  },
  {
    cliente: "CLIENTE 3",
    preco: "3",
    qualidade: "3",
    entrega: "3",
    inovacao: "3",
    portifolio: "3",
  },
  {
    cliente: "CLIENTE 4",
    preco: "3",
    qualidade: "3",
    entrega: "3",
    inovacao: "3",
    portifolio: "3",
  },
  {
    cliente: "CLIENTE 5",
    preco: "3",
    qualidade: "3",
    entrega: "3",
    inovacao: "3",
    portifolio: "3",
  },
];

const swot = [
  {
    oportunidadeId: "-",
    ameacaId: "-",
    atratividade_da_oportunidade: "-",
    relevancia_da_ameaca: "-",
    probabilidade_de_sucesso_da_oportunidade: "-",
    probabilidade_de_ocorrer_a_ameaca: "-",
  },
  {
    oportunidadeId: "-",
    ameacaId: "-",
    atratividade_da_oportunidade: "-",
    relevancia_da_ameaca: "-",
    probabilidade_de_sucesso_da_oportunidade: "-",
    probabilidade_de_ocorrer_a_ameaca: "-",
  },
  {
    oportunidadeId: "-",
    ameacaId: "-",
    atratividade_da_oportunidade: "-",
    relevancia_da_ameaca: "-",
    probabilidade_de_sucesso_da_oportunidade: "-",
    probabilidade_de_ocorrer_a_ameaca: "-",
  },
  {
    oportunidadeId: "-",
    ameacaId: "-",
    atratividade_da_oportunidade: "-",
    relevancia_da_ameaca: "-",
    probabilidade_de_sucesso_da_oportunidade: "-",
    probabilidade_de_ocorrer_a_ameaca: "-",
  },
  {
    oportunidadeId: "-",
    ameacaId: "-",
    atratividade_da_oportunidade: "-",
    relevancia_da_ameaca: "-",
    probabilidade_de_sucesso_da_oportunidade: "-",
    probabilidade_de_ocorrer_a_ameaca: "-",
  },
];

exports.setupData = async (empresa, ano) => {
  const service = new TemplateService(empresa, ano);
  await service.createTemplate(Clientes, data);
};

exports.setupSwot = async (empresa, ano) => {
  const service = new TemplateService(empresa, ano);
  await service.createTemplate(Clientes_Swot, swot);
};

exports.setup = async (empresa, ano) => {
  await this.setupData(empresa, ano);
  await this.setupSwot(empresa, ano);
};
