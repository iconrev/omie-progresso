const models = require("../../models");

const {
  Objetivo_Produtividade,
  Objetivo_Qualidade,
  Objetivo_Eficiencia,
  Objetivo_Logistica,
} = models;

module.exports.buscarMetaProdutividade = async (company, ano_exercicio) => {
  const processos = await company.getProcessesByYear(ano_exercicio);
  if (!processos) return null;

  const filter = {
    where: {
      EmpresaId: company.id,
      processoId: processos.id,
    },
    raw: true,
  };
  const objetivo = await Objetivo_Produtividade.findOne(filter);
  return objetivo;
};

module.exports.buscarMetaQualidade = async (company, ano_exercicio) => {
  const processos = await company.getProcessesByYear(ano_exercicio);
  if (!processos) return null;

  const filter = {
    where: {
      EmpresaId: company.id,
      processoId: processos.id,
    },
    raw: true,
  };
  const objetivo = await Objetivo_Qualidade.findOne(filter);
  return objetivo;
};

module.exports.buscarMetaEficiencia = async (company, ano_exercicio) => {
  const processos = await company.getProcessesByYear(ano_exercicio);
  if (!processos) return null;

  const filter = {
    where: {
      EmpresaId: company.id,
      processoId: processos.id,
    },
    raw: true,
  };
  const objetivo = await Objetivo_Eficiencia.findOne(filter);
  return objetivo;
};

module.exports.buscarMetaLogistica = async (company, ano_exercicio) => {
  const processos = await company.getProcessesByYear(ano_exercicio);
  if (!processos) return null;

  const filter = {
    where: {
      EmpresaId: company.id,
      processoId: processos.id,
    },
    raw: true,
  };
  const objetivo = await Objetivo_Logistica.findOne(filter);
  return objetivo;
};
