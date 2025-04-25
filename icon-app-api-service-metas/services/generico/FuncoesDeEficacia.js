const models = require("../../models");

const {
  Diretrizes_Eficacia_Dre,
  Diretrizes_Eficacia_Levantamento,
  Diretrizes_Eficacia_Metas_Personalizadas,
} = models;

const deleteAllDre = async (companyId, year, month) => {
  let response = false;

  const filter = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: year,
      mes: month,
    },
    raw: true,
  };

  await Diretrizes_Eficacia_Dre.destroy(filter)
    .then(() => {
      console.info("Excluído com sucesso", filter.where);
      response = true;
    })
    .catch((err) => {
      console.error(err);
    });

  return response;
};

const deleteAllLevantamento = async (companyId, year, month) => {
  let response = false;

  const filter = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: year,
      mes: month,
    },
    raw: true,
  };

  await Diretrizes_Eficacia_Levantamento.destroy(filter)
    .then(() => {
      console.info("Excluído com sucesso", filter.where);
      response = true;
    })
    .catch((err) => {
      console.error(err);
    });

  return response;
};

const deleteAllMetasDashboard = async (companyId, year, resource) => {
  let response = false;

  const filter = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: year,
      campo: resource,
    },
    raw: true,
  };

  await Diretrizes_Eficacia_Metas_Personalizadas.destroy(filter)
    .then(() => {
      console.info("Excluído com sucesso", filter.where);
      response = true;
    })
    .catch((err) => {
      console.error(err);
    });

  return response;
};

module.exports.saveDre = async (companyId, dre, year, month) => {
  let response = false;
  const statusDelete = await deleteAllDre(companyId, year, month.id);

  if (!statusDelete) {
    return statusDelete;
  }

  const insertDre = [];
  const fields = Object.keys(dre);

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    insertDre.push({
      EmpresaId: companyId,
      ano_exercicio: year,
      mes: month.id,
      campo: field,
      valor: dre[field],
    });
  }

  await Diretrizes_Eficacia_Dre.bulkCreate(insertDre, { validate: true })
    .then(() => {
      console.info("DRE atualizado com sucesso");
      response = true;
    })
    .catch((err) => {
      console.error(err);
    });

  return response;
};

module.exports.getDreMensal = async (companyId, year, month = undefined) => {
  const response = {};

  const filter = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: year,
    },
    raw: true,
  };

  if (month) {
    filter.where.mes = month;
  }

  const result = await Diretrizes_Eficacia_Dre.findAll(filter);

  if (result.length > 0) {
    let despesas_operacionais = 0;

    result.forEach((row) => {
      response[`${row.ano_exercicio}_${row.campo}`] = row.valor;
      if (
        row.campo.includes("despesas") &&
        !row.campo.includes("financeiras")
      ) {
        despesas_operacionais += row.valor;
      }
    });

    const receita_bruta =
      response[`${year}_receita_servico_${month}`] +
      response[`${year}_receita_produto_${month}`] +
      response[`${year}_outras_receitas_${month}`];

    const deducoes_sobre_receita =
      response[`${year}_imposto_sobre_receitas_${month}`] +
      response[`${year}_devolucao_abatimentos_${month}`];

    const receita_liquida = receita_bruta - deducoes_sobre_receita;

    const custos =
      response[`${year}_custo_dos_produtos_industrializados_${month}`];

    const lucro_bruto = receita_liquida - custos;
    const ebitda = lucro_bruto - despesas_operacionais;

    const resultado_financeiro =
      response[`${year}_receitas_financeiras_${month}`] -
      response[`${year}_despesas_financeiras_${month}`];

    const lucro_operacional =
      ebitda +
      resultado_financeiro -
      response[`${year}_depreciacao_amortizacao_${month}`];

    const lucro_liquido =
      lucro_operacional -
      (response[`${year}_imposto_de_renda_${month}`] +
        response[`${year}_constribuicao_social_${month}`]);

    response[`${year}_receita_bruta_${month}`] = receita_bruta;
    response[`${year}_deducoes_sobre_receita_${month}`] =
      deducoes_sobre_receita;
    response[`${year}_receita_liquida_${month}`] = receita_liquida;
    response[`${year}_custos_${month}`] = custos;
    response[`${year}_lucro_bruto_${month}`] = lucro_bruto;
    response[`${year}_despesas_${month}`] = despesas_operacionais;
    response[`${year}_ebitda_${month}`] = ebitda;
    response[`${year}_resultado_financeiro_${month}`] = resultado_financeiro;
    response[`${year}_lucro_operacional_${month}`] = lucro_operacional;
    response[`${year}_lucro_liquido_${month}`] = lucro_liquido;
    response[`${year}_rentabilidade_${month}`] =
      (100 / receita_bruta) * lucro_liquido;
    response[`${year}_ebitda_percentage_${month}`] =
      (100 / receita_bruta) * ebitda;
    response[`${year}_persist_${month}`] = true;
  } else {
    const despesas_operacionais = 0;

    const receita_bruta = 0;

    const deducoes_sobre_receita = 0;

    const receita_liquida = receita_bruta - deducoes_sobre_receita;

    const custos = 0;

    const lucro_bruto = receita_liquida - custos;
    const ebitda = lucro_bruto - despesas_operacionais;

    const resultado_financeiro = 0;

    const lucro_operacional = ebitda + resultado_financeiro - 0;

    const lucro_liquido = lucro_operacional - 0 + 0;

    response[`${year}_receita_bruta_${month}`] = receita_bruta;
    response[`${year}_deducoes_sobre_receita_${month}`] =
      deducoes_sobre_receita;
    response[`${year}_receita_liquida_${month}`] = receita_liquida;
    response[`${year}_custos_${month}`] = custos;
    response[`${year}_lucro_bruto_${month}`] = lucro_bruto;
    response[`${year}_despesas_${month}`] = despesas_operacionais;
    response[`${year}_ebitda_${month}`] = ebitda;
    response[`${year}_resultado_financeiro_${month}`] = resultado_financeiro;
    response[`${year}_lucro_operacional_${month}`] = lucro_operacional;
    response[`${year}_lucro_liquido_${month}`] = lucro_liquido;
    response[`${year}_rentabilidade_${month}`] =
      (100 / receita_bruta) * lucro_liquido;
    response[`${year}_ebitda_percentage_${month}`] =
      (100 / receita_bruta) * ebitda;
    response[`${year}_persist_${month}`] = false;
  }

  return response;
};

module.exports.getLevantamento = async (companyId, year, month = undefined) => {
  const response = {};

  const filter = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: year,
    },
    raw: true,
  };
  if (month) {
    filter.where.mes = month;
  }

  const result = await Diretrizes_Eficacia_Levantamento.findAll(filter);
  if (result.length > 0) {
    result.forEach((row) => {
      response[`${row.ano_exercicio}_${row.campo}`] =
        row.quiz === null ? row.valor : row.quiz;
    });
  }

  return response;
};

module.exports.saveLevantamento = async (
  companyId,
  levantamento,
  year,
  month
) => {
  let response = false;
  const statusDelete = await deleteAllLevantamento(companyId, year, month.id);

  if (!statusDelete) {
    return statusDelete;
  }

  const insertLevantamento = [];
  const fields = Object.keys(levantamento);

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    insertLevantamento.push({
      EmpresaId: companyId,
      ano_exercicio: year,
      mes: month.id,
      campo: field,
      valor: typeof levantamento[field] === "string" ? 0 : levantamento[field],
      quiz:
        typeof levantamento[field] === "string" ? levantamento[field] : null,
    });
  }

  await Diretrizes_Eficacia_Levantamento.bulkCreate(insertLevantamento, {
    validate: true,
  })
    .then(() => {
      console.info("Levantamento atualizado com sucesso");
      response = true;
    })
    .catch((err) => {
      console.error(err);
    });

  return response;
};

module.exports.saveMetaDashboard = async (
  companyId,
  year,
  resource,
  data,
  meses
) => {
  let response = false;
  const statusDelete = await deleteAllMetasDashboard(companyId, year, resource);

  if (!statusDelete) {
    return statusDelete;
  }

  const insertMetaDashboard = [];

  for (let i = 0; i < meses.length; i++) {
    const mes = meses[i];
    insertMetaDashboard.push({
      EmpresaId: companyId,
      campo: resource,
      ano_exercicio: year,
      mes: mes.id,
      valor: data[mes.pos],
    });
  }

  await Diretrizes_Eficacia_Metas_Personalizadas.bulkCreate(
    insertMetaDashboard,
    { validate: true }
  )
    .then(() => {
      console.info("Levantamento atualizado com sucesso");
      response = true;
    })
    .catch((err) => {
      console.error(err);
    });

  return response;
};

module.exports.validaMetaPersonalizada = async (
  companyId,
  resource,
  year,
  responseDefault
) => {
  let response = [];

  const filter = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: year,
      campo: resource,
    },
    raw: true,
  };

  const metas = await Diretrizes_Eficacia_Metas_Personalizadas.findAll(filter);
  if (metas.length === 12) {
    console.info("Devolvendo metas personalizadas");
    metas.forEach((meta) => {
      response.push(meta.valor);
    });
  } else {
    console.info("Devolvendo metas default");
    response = responseDefault;
  }

  return response;
};
