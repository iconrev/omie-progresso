const models = require("../../models");

const {
  Objetivo_Marketing,
  Objetivo_Vendas,
  Objetivo_Relacionamento,
  Objetivo_Satisfacao_Cliente,
} = models;

module.exports.buscarMetaMarketing = async (company, ano_exercicio) => {
  const vendas = await company.getCommercialByYear(ano_exercicio);
  if (!vendas) return null;

  const filter = {
    where: {
      EmpresaId: company.id,
      vendasId: vendas.id,
    },
    raw: true,
  };

  const objetivo = await Objetivo_Marketing.findOne(filter);
  return objetivo;
};

module.exports.buscarMetaVendas = async (company, ano_exercicio) => {
  const vendas = await company.getCommercialByYear(ano_exercicio);
  if (!vendas) return null;

  const filter = {
    where: {
      EmpresaId: company.id,
      vendasId: vendas.id,
    },
    raw: true,
  };

  const objetivo = await Objetivo_Vendas.findOne(filter);
  return objetivo;
};

module.exports.buscarMetaRelacionamento = async (company, ano_exercicio) => {
  const vendas = await company.getCommercialByYear(ano_exercicio);
  if (!vendas) return null;

  const filter = {
    where: {
      EmpresaId: company.id,
      vendasId: vendas.id,
    },
    raw: true,
  };

  const objetivo = await Objetivo_Relacionamento.findOne(filter);
  return objetivo;
};

module.exports.buscarMetaSatisfacao = async (company, ano_exercicio) => {
  const vendas = await company.getCommercialByYear(ano_exercicio);
  if (!vendas) return null;

  const filter = {
    where: {
      EmpresaId: company.id,
      vendasId: vendas.id,
    },
    raw: true,
  };

  const objetivo = await Objetivo_Satisfacao_Cliente.findOne(filter);
  return objetivo;
};
