const models = require("../../models");

const { Objetivo_Custos, Objetivo_Rentabilidade, Objetivo_Endividamento } =
  models;

module.exports.buscarMetaFinanceiro = async (company, ano_exercicio) => {
  const dre = await company.getDreByYear(ano_exercicio);
  if (!dre) return null;

  const objetivosReceita = await company.getObjetivoReceitasByDreId(dre.id);
  if (!objetivosReceita) return false;

  const objetivosCustos = await company.getObjetivoCustosByDreId(dre.id);

  return {
    ...objetivosReceita,
    despesas_total:
      objetivosCustos && objetivosCustos.despesas_total
        ? objetivosCustos.despesas_total
        : 0,
    despesas_com_pessoal:
      objetivosCustos && objetivosCustos.despesas_com_pessoal
        ? objetivosCustos.despesas_com_pessoal
        : 0,
    despesas:
      objetivosCustos && objetivosCustos.despesas
        ? objetivosCustos.despesas
        : [],
  };
};

module.exports.buscarMetaRentabilidade = async (company, ano_exercicio) => {
  const dre = await company.getDreByYear(ano_exercicio);
  if (!dre) return null;

  const filter = {
    where: {
      EmpresaId: company.id,
      dreId: dre.id,
    },
    raw: true,
  };
  const objetivo = await Objetivo_Rentabilidade.findOne(filter);
  return objetivo;
};

module.exports.buscarMetaCustos = async (company, ano_exercicio) => {
  const dre = await company.getDreByYear(ano_exercicio);
  if (!dre) return null;

  const filter = {
    where: {
      EmpresaId: company.id,
      dreId: dre.id,
    },
    raw: true,
  };
  const objetivo = await Objetivo_Custos.findOne(filter);
  return objetivo;
};

module.exports.buscarMetaEndividamento = async (company, ano_exercicio) => {
  const dre = await company.getDreByYear(ano_exercicio);
  if (!dre) return null;

  const { endividamento, inadimplencia } = dre.inputs;

  const filter = {
    where: {
      EmpresaId: company.id,
      dreId: dre.id,
    },
    raw: true,
  };
  let response;
  const objetivo = await Objetivo_Endividamento.findOne(filter);

  if (objetivo) {
    response = {
      ...objetivo,
      inadimplencia_mensal_anterior: inadimplencia,
      endividamento_anterior: endividamento,
    };
  }

  return response;
};
