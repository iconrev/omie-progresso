const models = require("../../../models");
const Filtro = require("../../../generico/FiltrarAnoEmpresa");
const Handler = require("../../handler");
const AnoExercicioEmpresa = require("../../generico/AnoExercicioEmpresa");
const Logger = require("../../../auth/logService");
const { gravarPontos } = require("./swot");

const {
  Dre,
  Dre_Despesas,
  Analise_Objetivo_Receitas,
  Analise_Objetivo_Rentabilidade,
  Analise_Objetivo_Endividamento,
  Analise_Dre_Custos,
  Resumo_Interno,
} = models;

const despesasDefaults = [
  { key: "despesas_com_pessoal", label: "Pessoal", editable: false },
  { key: "despesas_vendas", label: "Comerciais", editable: true },
  { key: "despesas_administrativas", label: "Administrativa", editable: true },
  { key: "despesas_tributaria", label: "Tributárias", editable: true },
  { key: "despesas_viagens", label: "Viagens", editable: true },
  { key: "despesas_logistica", label: "Logística", editable: true },
  { key: "despesas_servicos_pj", label: "Serviços", editable: true },
  { key: "despesas_ocupacao", label: "Ocupação", editable: true },
];

const nameNormalize = (name) => {
  const normalized = name.normalize("NFD");
  const replaced = normalized.replace(/[\u0300-\u036f]/g, "");
  const space_replaced = replaced.replace(/\s/g, "_");
  const response = space_replaced.toLowerCase();
  return response;
};

const calcula_smile_points = (smile) => {
  if (smile) {
    if (smile.includes("Bom")) {
      return 3;
    }
    if (smile.includes("Neutro")) {
      return 2;
    }
    if (smile.includes("Ruim")) {
      return 1;
    }
  }
  return 0;
};

const dre_registro_avaliacao = async (resource, data, companyId, ano) => {
  const { DreId, smiles } = data;

  try {
    const resources = {
      receitas: Analise_Objetivo_Receitas,
      rentabilidade: Analise_Objetivo_Rentabilidade,
      custos: Analise_Dre_Custos,
      endividamento: Analise_Objetivo_Endividamento,
    };
    const objeto = resources[resource];

    const filter = {
      where: {
        DreId,
      },
      raw: true,
    };

    // criar ou alterar os dados do recurso
    if (objeto) {
      await objeto
        .findOne(filter)
        .then(async (analise) => {
          console.info("Salvando...", resource);
          if (analise) {
            await objeto
              .update(smiles, {
                where: {
                  DreId,
                },
              })
              .then(async () => {
                console.info("Avaliação salva com sucesso");

                await gravarPontos(companyId, smiles, ano, "financeiro")
                  .then((ok) =>
                    console.info(`Pontos processos gravados com sucesso`, ok)
                  )
                  .catch((err) =>
                    console.error(
                      `Não foi possível gravar pontos financeiro para o swot`,
                      err
                    )
                  );
              })
              .catch((err) => {
                console.error(err);
              });
          } else {
            const data = {
              DreId,
              ...smiles,
            };
            await objeto
              .create({
                ...data,
              })
              .then(async () => {
                await gravarPontos(companyId, smiles, ano, "financeiro")
                  .then((ok) =>
                    console.info(`Pontos processos gravados com sucesso`, ok)
                  )
                  .catch((err) =>
                    console.error(
                      `Não foi possível gravar pontos financeiro para o swot`,
                      err
                    )
                  );
              })
              .catch((err) => {
                console.error(err);
              });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  } catch (error) {
    console.error("", "", error);
  }
};

const calculaObjetivoReceita = (dreId) => {
  if (dreId) {
    return new Promise((resolve, reject) => {
      Analise_Objetivo_Receitas.findOne({
        where: {
          DreId: dreId,
        },
        raw: true,
      })
        .then((analise) => {
          resolve(analise);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

const calculaObjetivoRentabilidade = (dreId) => {
  return new Promise((resolve, reject) => {
    Analise_Objetivo_Rentabilidade.findOne({
      where: {
        DreId: dreId,
      },
      raw: true,
    })
      .then((analise) => {
        resolve(analise);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const calculaObjetivoCusto = (dreId) => {
  return new Promise((resolve, reject) => {
    Analise_Dre_Custos.findOne({
      where: {
        DreId: dreId,
      },
      raw: true,
    })
      .then((analise) => {
        resolve(analise);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const calculaObjetivoEndividamento = (dreId) => {
  return new Promise((resolve, reject) => {
    Analise_Objetivo_Endividamento.findOne({
      where: {
        DreId: dreId,
      },
      raw: true,
    })
      .then((analise) => {
        resolve(analise);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const analise_desempenho_financeiro = async (company, dre) => {
  try {
    const { receita_bruta } = dre.inputs;
    const { lucro_liquido } = dre.inputs;
    const { rentabilidade } = dre.inputs;
    const { ebitda } = dre.inputs;
    const { receita_liquida } = dre.inputs;
    const custos = dre.inputs.custo_total;
    const { inadimplencia, inadimplencia_perc } = dre.inputs;
    const { anos_divida } = dre.inputs;

    let rentabilidade_total = dre.inputs.rentabilidade;
    let ebitda_total = dre.inputs.ebitda;

    let anos = 1;

    // calcula dre dos anos anteriores se houver...
    const ano_exercicio = dre.year - 1;
    for (let i = 0; i < 2; i++) {
      const dreAnterior = await company.getDreByYear(ano_exercicio - i);
      if (dreAnterior) {
        rentabilidade_total += dreAnterior.inputs.rentabilidade;
        ebitda_total += dreAnterior.inputs.ebitda;
        anos += 1;
      }
    }

    const ebitda_medio = ebitda_total / anos;
    const rentabilidade_media = rentabilidade_total / anos;

    let ebitda_ano_passado_diferenca = 0.0;
    let percentual_ebitda_ano_passado = 0.0;
    const { percentual_ebitda } = dre.inputs;

    let receita_bruta_passado = 0.0;
    let crescimento_quatro = 0.0;
    let crescimento = 0.0;

    const dreAnoAnterior = await company.getDreByYear(dre.year - 1);
    if (dreAnoAnterior) {
      percentual_ebitda_ano_passado = dreAnoAnterior.inputs.percentual_ebitda;
      ebitda_ano_passado_diferenca =
        percentual_ebitda - percentual_ebitda_ano_passado;

      receita_bruta_passado = dreAnoAnterior.inputs.receita_bruta;
      crescimento_quatro = receita_bruta - receita_bruta_passado;
      crescimento = (crescimento_quatro / receita_bruta_passado) * 100;
    }

    // Smiles
    const smiles = {};

    await calculaObjetivoReceita(dre.id).then((analise_objetivo) => {
      smiles.smile_receita_bruta = analise_objetivo
        ? analise_objetivo.smile_receita_bruta
        : "";
      smiles.smile_crescimento = analise_objetivo
        ? analise_objetivo.smile_crescimento
        : "";
    });

    await calculaObjetivoRentabilidade(dre.id).then((analise_objetivo) => {
      smiles.smile_rentabilidade_ultimo = analise_objetivo
        ? analise_objetivo.smile_rentabilidade_ultimo
        : "";
      smiles.smile_ebitda_ultimo = analise_objetivo
        ? analise_objetivo.smile_ebitda_ultimo
        : "";
    });

    await calculaObjetivoCusto(dre.id).then((analise_objetivo) => {
      smiles.smile_percentual_total_despesas = analise_objetivo
        ? analise_objetivo.percentual_total_despesas
        : "";
      smiles.smile_custo_mercadoria = analise_objetivo
        ? analise_objetivo.custo_das_mercadorias_vendidas
        : "";
    });

    await calculaObjetivoEndividamento(dre.id).then((analise_objetivo) => {
      smiles.smile_taxa_divida_lucro = analise_objetivo
        ? analise_objetivo.smile_taxa_divida_lucro
        : "";
      smiles.smile_inadimplencia = analise_objetivo
        ? analise_objetivo.smile_inadimplencia
        : "";
    });

    const ebitda_percentage = (100 / receita_bruta) * ebitda;
    const dre_imposto_sobre_receitas = dre.inputs.imposto_sobre_receitas;

    const imposto_sobre_receitas =
      receita_bruta > 0 && dre_imposto_sobre_receitas > 0
        ? (dre_imposto_sobre_receitas / receita_bruta) * 100
        : 0;
    const lucro_bruto =
      receita_bruta -
      dre_imposto_sobre_receitas -
      (dre.inputs.devolucao_abatimentos || 0) -
      (dre.inputs.custo_dos_produtos_industrializados || 0);

    const impostoSobreLucro =
      (dre.inputs.imposto_de_renda || 0) +
      (dre.inputs.constribuicao_social || 0);
    const imposto_sobre_lucro_perc =
      impostoSobreLucro > 0 && receita_bruta > 0
        ? (impostoSobreLucro / receita_bruta) * 100
        : 0;

    const custo_dos_produtos_industrializados =
      dre.inputs.custo_dos_produtos_industrializados > 0 && receita_bruta > 0
        ? (100 / receita_bruta) * dre.inputs.custo_dos_produtos_industrializados
        : 0;

    const dicio_retorno = {
      receita_bruta,
      lucro_liquido,
      receita_liquida,
      ebitda,
      ebitda_percentage,
      ebitda_medio,
      ebitda_ano_passado_diferenca,
      rentabilidade,
      rentabilidade_media,
      percentual_ebitda_ano_passado,
      crescimento,
      crescimento_quatro,
      inadimplencia: inadimplencia_perc,
      inadimplencia_valor: inadimplencia,
      divida: dre.inputs.endividamento || 0,
      // anos para quitar dívida
      taxa: anos_divida,
      custos,
      custo_dos_produtos_industrializados,
      despesas_totais: dre.inputs.valor_total_despesas_operacionais || 0,
      despesas: dre.despesas || [],
      imposto_sobre_receitas: parseFloat(imposto_sobre_receitas.toFixed(2)),
      lucro_bruto,
      depreciacao_amortizacao: dre.inputs.depreciacao_amortizacao || 0,
      imposto_sobre_lucro: impostoSobreLucro,
      imposto_sobre_lucro_perc,
      // SMILES
      smiles,
      dre: dre.id,
    };
    return dicio_retorno;
  } catch (error) {
    console.info(error);
    return null;
  }
};

const updateEficienciaFinanceiro = async (
  companyId,
  ano_definido = null,
  avaliacao = null
) => {
  // obtem o ano disponível para análise
  let ano_exercicio = 0;

  if (ano_definido) {
    ano_exercicio = parseInt(ano_definido, 10) - 1;
  } else {
    await Filtro.ultimo_ano_exercicio(Dre, companyId).then((ano) => {
      ano_exercicio = ano;
    });
  }

  let dre = null;
  await Dre.findOne({
    where: {
      EmpresaId: companyId,
      ano_exercicio,
    },
    raw: true,
  }).then(async (financeiro) => {
    dre = financeiro;
  });

  let total_smile_points = 0.0;
  let percentual_eficacia = 0.0;

  // Espera-se um range de -3/3 smiles points
  if (dre) {
    // faturamento
    await calculaObjetivoReceita(dre.id).then((analise_objetivo) => {
      if (analise_objetivo) {
        total_smile_points += calcula_smile_points(
          analise_objetivo.smile_receita_bruta
        );
        total_smile_points += calcula_smile_points(
          analise_objetivo.smile_crescimento
        );
      }
    });

    // rentabilidade
    await calculaObjetivoRentabilidade(dre.id).then((analise_objetivo) => {
      if (analise_objetivo) {
        total_smile_points += calcula_smile_points(
          analise_objetivo.smile_rentabilidade_ultimo
        );
        total_smile_points += calcula_smile_points(
          analise_objetivo.smile_ebitda_ultimo
        );
      }
    });

    // custos
    await calculaObjetivoCusto(dre.id).then((analise_custo) => {
      if (analise_custo) {
        total_smile_points += calcula_smile_points(
          analise_custo.custo_das_mercadorias_vendidas
        );
        total_smile_points += calcula_smile_points(
          analise_custo.percentual_total_despesas
        );
      }
    });

    // endividamento
    await calculaObjetivoEndividamento(dre.id).then((analise_objetivo) => {
      if (analise_objetivo) {
        total_smile_points += calcula_smile_points(
          analise_objetivo.smile_taxa_divida_lucro
        );
        total_smile_points += calcula_smile_points(
          analise_objetivo.smile_inadimplencia
        );
      }
    });
  }

  if (total_smile_points > 0) {
    const indicador_maximo = 8 * 3;
    percentual_eficacia = (total_smile_points / indicador_maximo) * 100;
  }

  // faz atualização do resumo interno
  await this.atualizar_resumo(
    companyId,
    ano_exercicio,
    percentual_eficacia,
    "financeiro"
  );

  if (avaliacao) {
    avaliacao[ano_definido] = {
      ano: ano_exercicio,
      percentual: percentual_eficacia,
    };
  }
};

module.exports.gauge = async (event, action) => {
  const { companyId } = action;
  const anos = await AnoExercicioEmpresa.getAll(companyId);
  const avaliacao = {};

  const promises = anos.map((ano) =>
    updateEficienciaFinanceiro(companyId, ano, avaliacao)
  );
  await Promise.all(promises);

  return Handler.Ok({
    avaliacao,
  });
};

module.exports.diagnostico_analise_desempenho_financeiro = async (
  event,
  action
) => {
  const { company } = action;
  const anos = await company.getExercises();
  const analise = {};

  const run = async (ano) => {
    const ano_analise = ano - 1;
    const dre = await company.getDreByYear(ano_analise);

    if (dre) {
      const result = await analise_desempenho_financeiro(company, dre);

      if (result.receita_bruta === 0 && result.lucro_liquido === 0) {
        analise[ano] = {
          status: "diagnostic_not_found",
          message: `Os dados do DRE de ${ano_analise} estão incompletos.`,
        };
      } else {
        analise[ano] = result;
        analise[ano].status = "success";
      }
    } else {
      analise[ano] = {
        status: "diagnostic_not_found",
        message: `Não há Análise de Desempenho Financeiro para o ano de ${ano}.`,
      };
    }
  };

  await Promise.all(anos.map((ano) => run(ano)));

  const logInfo = `Carregando avaliação do Ambiente Interno [financeiro]`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    analise,
  });
};

module.exports.diagnostic_internal_financial_evaluation_update = async (
  event,
  action
) => {
  const { company, companyId } = action;
  const body = JSON.parse(event.body);

  const { smiles, year } = body;
  const ano = parseInt(year, 10) - 1;

  const dre = await company.getDreByYear(ano);
  if (!dre) {
    return Handler.BadRequest({
      status: "dre_not_found",
      message:
        "Não foi possível localizar o DRE para o ano de exercício informado.",
    });
  }

  const dreId = dre.id;
  const drePromises = [];

  let data = {
    DreId: dreId,
    smiles: {
      smile_receita_bruta: smiles.smile_receita_bruta,
      smile_crescimento: smiles.smile_crescimento,
    },
  };
  drePromises.push(dre_registro_avaliacao("receitas", data, companyId, ano));

  data = {
    DreId: dreId,
    smiles: {
      smile_lucro_liquido: smiles.smile_lucro_liquido,
      smile_rentabilidade_media: smiles.smile_rentabilidade_media,
      smile_rentabilidade_ultimo: smiles.smile_rentabilidade_ultimo,
      smile_ebitda_medio: smiles.smile_ebitda_medio,
      smile_ebitda_ultimo: smiles.smile_ebitda_ultimo,
    },
  };
  drePromises.push(
    dre_registro_avaliacao("rentabilidade", data, companyId, ano)
  );

  data = {
    DreId: dreId,
    smiles: {
      percentual_custo_folha: smiles.smile_percentual_custo_folha,
      percentual_custo_comercial: smiles.smile_percentual_custo_comercial,
      percentual_despesas_administrativas:
        smiles.smile_percentual_despesas_administrativas,
      percentual_despesas_tributaria:
        smiles.smile_percentual_despesas_tributaria,
      percentual_despesas_viagens: smiles.smile_percentual_despesas_viagens,
      percentual_despesas_logistica: smiles.smile_percentual_despesas_logistica,
      percentual_despesas_servicos: smiles.smile_percentual_despesas_servicos,
      percentual_despesas_ocupacao: smiles.smile_percentual_despesas_ocupacao,
      percentual_total_despesas: smiles.smile_percentual_total_despesas,
      custo_das_mercadorias_vendidas: smiles.smile_custo_mercadoria,
    },
  };
  drePromises.push(dre_registro_avaliacao("custos", data, companyId, ano));

  data = {
    DreId: dreId,
    smiles: {
      smile_divida: smiles.smile_divida,
      smile_taxa_divida_lucro: smiles.smile_taxa_divida_lucro,
      smile_inadimplencia: smiles.smile_inadimplencia,
    },
  };
  drePromises.push(
    dre_registro_avaliacao("endividamento", data, companyId, ano)
  );

  await Promise.all(drePromises);

  await updateEficienciaFinanceiro(companyId);

  const logInfo = `Avaliação do Ambiente Interno [financeiro] do ano [${
    ano + 1
  }] atualizado com sucesso`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    message: "Dados atualizados com sucesso",
  });
};

module.exports.dados = async (event, action) => {
  const { company } = action;

  let _ano = "";
  if (event.queryStringParameters) {
    const { ano } = event.queryStringParameters;
    _ano = ano;
  }

  const dre_list = {
    ano_exercicio: [],
    receita_servico: [],
    receita_produto: [],
    outras_receitas: [],
    deducoes_receitas: [],
    devolucao_abatimentos: [],
    imposto_sobre_receitas: [],
    custo_das_mercadorias_vendidas: [],
    custo_dos_produtos_industrializados: [],
    despesas: [],
    despesas_operacionais: [],
    receitas_financeiras: [],
    despesas_financeiras: [],
    despesas_indedutiveis: [],
    depreciacao_amortizacao: [],
    endividamento: [],
    inadimplencia: [],
    receita_bruta: [],
    receita_liquida: [],
    custo_total: [],
    lucro_bruto: [],
    ebitda: [],
    lucro_operacional: [],
    lucro_liquido: [],
    resultado_exercicio: [],
    imposto_de_renda: [],
    constribuicao_social: [],
    lucro_prejuizo_liquido: [],
  };

  const list = _ano.split(",");

  const params = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item !== "") {
      params.push(parseInt(item, 10));
    }
  }

  for (let i = 0; i < params.length; i++) {
    const year = params[i];
    // eslint-disable-next-line no-await-in-loop
    const dre = await company.getDreByYear(year);
    if (!dre) {
      // eslint-disable-next-line no-await-in-loop
      const newDre = await company.createNewDre(year);

      for (const key in dre_list) {
        if (key === "despesas") continue;
        const value = key === "ano_exercicio" ? year : 0;
        dre_list[key].push(value);
      }

      dre_list.despesas.push(newDre.despesas);
    } else {
      const item = dre.inputs;
      dre_list.ano_exercicio.push(item.ano_exercicio);
      dre_list.receita_servico.push(item.receita_servico);
      dre_list.receita_produto.push(item.receita_produto);
      dre_list.outras_receitas.push(item.outras_receitas);
      dre_list.devolucao_abatimentos.push(item.devolucao_abatimentos);
      dre_list.imposto_sobre_receitas.push(item.imposto_sobre_receitas);

      dre_list.custo_das_mercadorias_vendidas.push(
        item.custo_das_mercadorias_vendidas
      );

      dre_list.custo_dos_produtos_industrializados.push(
        item.custo_dos_produtos_industrializados
      );

      dre_list.despesas.push(dre.despesas);
      dre_list.despesas_operacionais.push(
        item.valor_total_despesas_operacionais
      );

      dre_list.despesas_financeiras.push(item.despesas_financeiras);
      dre_list.receitas_financeiras.push(item.receitas_financeiras);
      dre_list.despesas_indedutiveis.push(item.despesas_indedutiveis);

      // apenas se o campo imposto de renda estiver vazio...
      if (item.imposto_de_renda === 0) {
        // este campo foi removido, pegar o conteudo e colocar em "imposto_de_renda"
        dre_list.imposto_de_renda.push(item.irpj_e_csll);
      } else {
        dre_list.imposto_de_renda.push(item.imposto_de_renda);
      }

      dre_list.constribuicao_social.push(item.constribuicao_social);

      dre_list.depreciacao_amortizacao.push(item.depreciacao_amortizacao);

      dre_list.endividamento.push(item.endividamento);
      dre_list.inadimplencia.push(item.inadimplencia);

      dre_list.receita_bruta.push(item.receita_bruta);
      dre_list.receita_liquida.push(item.receita_liquida);
      dre_list.custo_total.push(item.custo_dos_produtos_industrializados);
      dre_list.lucro_bruto.push(item.lucro_bruto);
      dre_list.deducoes_receitas.push(item.deducoes_sobre_receita);
      dre_list.lucro_operacional.push(item.lucro_operacional);
      dre_list.lucro_liquido.push(item.lucro_liquido);
      dre_list.resultado_exercicio.push(item.resultado_financeiro);
      dre_list.ebitda.push(item.ebitda);
    }
  }

  const logInfo = `Carregando [financeiro] para os anos [${params}]`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    data: dre_list,
  });
};

module.exports.update_data = async (event, action) => {
  const { companyId } = action;
  const { data, year } = JSON.parse(event.body);

  const dreData = {
    EmpresaId: companyId,
    ano_exercicio: year,
    ...data,
  };

  const filterDre = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: year,
    },
    raw: true,
  };
  const resultDre = await Dre.findOne(filterDre);
  if (resultDre) {
    await Dre.update(dreData, filterDre);
  } else {
    await Dre.create(dreData);
  }

  const items = Object.keys(data);
  const promisesArray = [];
  for (const item of items) {
    if (item.includes("despesa_")) {
      const idDespesa = item.replace("despesa_", "");
      const payload = {
        value: data[item],
      };
      const filter = {
        where: {
          id: idDespesa,
        },
      };

      try {
        promisesArray.push(Dre_Despesas.update(payload, filter));
      } catch (error) {
        console.error(error);
      }
    }
  }
  await Promise.all(promisesArray);

  const logInfo = `Dados [financeiro] de [${year}] atualizados com sucesso`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    message: "DRE atualizado com sucesso",
  });
};

module.exports.update_expense_category = async (event, action) => {
  const body = JSON.parse(event.body);

  const filter = {
    where: {
      description: body.old,
      editable: true,
    },
    include: {
      model: Dre,
      as: "dre",
      required: true,
      where: {
        EmpresaId: action.companyId,
      },
      attributes: ["EmpresaId"],
    },
    raw: true,
  };
  const despesas = await Dre_Despesas.findAll(filter);
  if (!despesas || despesas.length === 0) {
    return Handler.NotFound({
      status: "expense_not_found",
      message: "Despesa não localizada",
    });
  }

  // TODO
  // Antes de atualizar precisa verificar se tem alguma despesa com a mesma key e se é editável
  // Verificar se há algum objetivo associado a essa key

  const promises = despesas.map(async (despesa) => {
    const newExpense = {
      description: body.new,
      // key: nameNormalize(body.new),
    };
    const filterDespesa = {
      where: {
        id: despesa.id,
      },
    };
    Dre_Despesas.update(newExpense, filterDespesa);
  });

  await promises;

  const logInfo = `Despesa alterada com sucesso`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    message: "Categoria atualizada com sucesso",
  });
};

module.exports.atualizar_resumo = async (empresa, ano, valor, recurso) => {
  console.info(`Atualizando valores de ${recurso} em resumo interno `);

  try {
    await Resumo_Interno.findOne({
      where: {
        EmpresaId: empresa,
        ano_exercicio: ano,
      },
      raw: true,
    }).then(async (result) => {
      if (result) {
        let media;

        switch (recurso) {
          case "financeiro":
            media =
              (valor + result.comercial + result.processos + result.pessoas) /
              4;
            break;
          case "comercial":
            media =
              (valor + result.financeiro + result.processos + result.pessoas) /
              4;
            break;
          case "processos":
            media =
              (valor + result.financeiro + result.comercial + result.pessoas) /
              4;
            break;
          case "pessoas":
            media =
              (valor +
                result.financeiro +
                result.comercial +
                result.processos) /
              4;
            break;
        }

        await Resumo_Interno.update(
          {
            [recurso]: valor,
            valor: media,
          },
          {
            where: {
              EmpresaId: empresa,
              ano_exercicio: ano,
            },
          }
        )
          .then(async (result) => {
            console.info("INFO resumo interno atualizado com sucesso");
          })
          .catch((err) => {
            console.error("ERROR não foi possível atualizar resumo interno");
          });
      } else {
        await Resumo_Interno.create({
          EmpresaId: empresa,
          ano_exercicio: ano,
          [recurso]: valor,
        }).then((result) => {
          console.info("INFO resumo interna criado com sucesso");
        });
      }
    });
  } catch (error) {
    console.error("INFO não foi possível gravar resumo interno ", error);
  }
};

module.exports.analise_desempenho_financeiro = analise_desempenho_financeiro
module.exports.updateEficienciaFinanceiro = updateEficienciaFinanceiro