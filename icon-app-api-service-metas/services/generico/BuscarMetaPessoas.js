const models = require("../../models");

const {
  Objetivo_Inovacao,
  Objetivo_Competencia,
  Objetivo_Engajamento,
  Objetivo_Retencao,
} = models;

module.exports.buscarMetaInovacao = async (company, ano_exercicio) => {
  const pessoas = await company.getPeopleByYear(ano_exercicio);
  if (!pessoas) return null;

  const filter = {
    where: {
      EmpresaId: company.id,
      pessoasId: pessoas.id,
    },
    raw: true,
  };
  const objetivo = await Objetivo_Inovacao.findOne(filter);
  return objetivo;
};

module.exports.buscarMetaCompetencias = async (company, ano_exercicio) => {
  const pessoas = await company.getPeopleByYear(ano_exercicio);
  if (!pessoas) return null;

  const filter = {
    where: {
      EmpresaId: company.id,
      pessoasId: pessoas.id,
    },
    raw: true,
  };
  const objetivo = await Objetivo_Competencia.findOne(filter);
  return objetivo;
};

module.exports.buscarMetaEngajamento = async (company, ano_exercicio) => {
  const pessoas = await company.getPeopleByYear(ano_exercicio);
  if (!pessoas) return null;

  const filter = {
    where: {
      EmpresaId: company.id,
      pessoasId: pessoas.id,
    },
    raw: true,
  };
  const objetivo = await Objetivo_Engajamento.findOne(filter);
  return objetivo;
};

module.exports.buscarMetaRetencao = async (company, ano_exercicio) => {
  const pessoas = await company.getPeopleByYear(ano_exercicio);
  if (!pessoas) return null;

  const filter = {
    where: {
      EmpresaId: company.id,
      pessoasId: pessoas.id,
    },
    raw: true,
  };
  const objetivo = await Objetivo_Retencao.findOne(filter);
  return objetivo;
};
