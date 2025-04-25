/* eslint-disable no-param-reassign */
const Handler = require("../../handler");
const models = require("../../../models");
const Dre_Source = require("./dre");

const { Dre, Processos, Processos_Avaliacao } = models;
const { gravarPontos } = require("./swot");
const Logger = require("../../../auth/logService");

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

const updateEficienciaProcessos = async (
  company,
  ano_definido = null,
  avaliacao
) => {
  let ano_exercicio = 0;

  ano_exercicio = parseInt(ano_definido, 10) - 1;

  let total_smile_points = 0.0;
  let porcentagem_processos = 0.0;

  if (ano_exercicio > 0) {
    const processos = await company.getProcessesByYear(ano_exercicio);
    if (processos) {
      await Processos_Avaliacao.findOne({
        where: { EmpresaId: company.id, ano_exercicio },
        raw: true,
      })
        .then(async (avaliacao) => {
          if (avaliacao) {
            total_smile_points += calcula_smile_points(
              avaliacao.faturamento_custo_folha
            );
            total_smile_points += calcula_smile_points(
              avaliacao.quantidade_entregue_funcionarios
            );
            total_smile_points += calcula_smile_points(
              avaliacao.refugo_retrabalho
            );
            total_smile_points += calcula_smile_points(
              avaliacao.custos_garantia
            );
            total_smile_points += calcula_smile_points(
              avaliacao.percentual_capacidade_produtiva
            );
            total_smile_points += calcula_smile_points(
              avaliacao.percentual_disponibilidade_equipamento
            );
            total_smile_points += calcula_smile_points(
              avaliacao.entregas_no_prazo
            );
            total_smile_points += calcula_smile_points(
              avaliacao.quantidade_giro_estoque
            );

            // numero de pontuação maxima
            if (total_smile_points > 0) {
              const pontos_maximos = 8 * 3;
              porcentagem_processos =
                (total_smile_points / pontos_maximos) * 100;
            }
          }
        })
        .catch((analise_objetivo_err) => {
          console.error(analise_objetivo_err);
        });
    }
  }

  await Dre_Source.atualizar_resumo(
    company.id,
    ano_exercicio,
    porcentagem_processos,
    "processos"
  );

  avaliacao[ano_definido] = {
    ano: ano_exercicio,
    percentual: porcentagem_processos,
  };
};

module.exports.gauge = async (event, action) => {
  const { company } = action;
  const anos = await company.getExercises();
  const avaliacao = {};

  const promises = anos.map((ano) =>
    updateEficienciaProcessos(company, ano, avaliacao)
  );
  await Promise.all(promises);

  return Handler.Ok({
    avaliacao,
  });
};

module.exports.processoSmile = async (event, action) => {
  const { company, companyId } = action;

  const anos = await company.getExercises();
  const analise = {};

  for (const ano of anos) {
    const ano_analise = parseInt(ano) - 1;
    const dreYear = await company.getDreByYear(ano_analise);

    if (!dreYear) {
      analise[ano] = {
        status: "dre_not_found",
        message: `DRE ${ano - 1} não preenchido.`,
      };
      continue;
    }

    const processo = await company.getProcessesByYear(ano_analise);

    if (!processo) {
      analise[ano] = {
        status: "diagnostic_not_found",
        message: `Não há Análise de Desempenho de Processos para o ano de ${ano_analise}.`,
      };
      continue;
    }

    const dre = dreYear.inputs;
    dreYear.despesas.forEach((despesa) => {
      dre[despesa.field] = despesa.value;
    });

    const custo_mercadorias_vendidas =
      dre.custo_dos_produtos_industrializados || 0;
    const percentual_capacidade_produtiva =
      processo.volume_produzido_no_ano > 0 && processo.capacidade_produzida > 0
        ? (processo.volume_produzido_no_ano / processo.capacidade_produzida) *
          100
        : 0;
    const quantidade_entregue_funcionarios =
      processo.volume_produzido_no_ano > 0 && processo.funcionarios > 0
        ? processo.volume_produzido_no_ano / processo.funcionarios
        : 0;
    const custos_garantia =
      processo.custos_garantia > 0
        ? (100 / dre.receita_bruta) * processo.custos_garantia
        : 0;
    const quantidade_giro_estoque =
      dre.receita_bruta > 0 && processo.valor_do_estoque > 0
        ? dre.receita_bruta / processo.valor_do_estoque
        : 0;
    const produtividade =
      dre.despesas_com_pessoal > 0
        ? dre.receita_bruta / dre.despesas_com_pessoal
        : 0;
    processo.percentual_disponibilidade_equipamento =
      100 - processo.percentual_disponibilidade_equipamento;

    const avaliacao = await Processos_Avaliacao.findOne({
      where: { EmpresaId: companyId, ano_exercicio: ano_analise },
      raw: true,
    });
    const avaliacaoResponse = avaliacao
      ? {
          smile_faturamento_custo_folha:
            avaliacao.faturamento_custo_folha || "NaoAvaliado",
          smile_quantidade_entregue_funcionarios:
            avaliacao.quantidade_entregue_funcionarios || "NaoAvaliado",
          smile_refugo_retrabalho: avaliacao.refugo_retrabalho || "NaoAvaliado",
          smile_custos_garantia: avaliacao.custos_garantia || "NaoAvaliado",
          smile_clientes_fidelizados:
            avaliacao.clientes_fidelizados || "NaoAvaliado",
          smile_percentual_capacidade_produtiva:
            avaliacao.percentual_capacidade_produtiva || "NaoAvaliado",
          smile_percentual_disponibilidade_equipamento:
            avaliacao.percentual_disponibilidade_equipamento || "NaoAvaliado",
          smile_entregas_no_prazo: avaliacao.entregas_no_prazo || "NaoAvaliado",
          smile_quantidade_giro_estoque:
            avaliacao.quantidade_giro_estoque || "NaoAvaliado",
          smile_valor_do_estoque: avaliacao.valor_do_estoque || "NaoAvaliado",
        }
      : {
          smile_faturamento_custo_folha: "NaoAvaliado",
          smile_quantidade_entregue_funcionarios: "NaoAvaliado",
          smile_refugo_retrabalho: "NaoAvaliado",
          smile_custos_garantia: "NaoAvaliado",
          smile_percentual_capacidade_produtiva: "NaoAvaliado",
          smile_percentual_disponibilidade_equipamento: "NaoAvaliado",
          smile_entregas_no_prazo: "NaoAvaliado",
          smile_quantidade_giro_estoque: "NaoAvaliado",
          smile_valor_do_estoque: "NaoAvaliado",
        };

    const receita_bruta_custo_folha =
      dre.receita_bruta / dre.despesas_com_pessoal || 0;
    const capacidade_produtiva =
      (processo.volume_produzido_no_ano / processo.capacidade_produzida) *
        100 || 0;
    const eficiencia_operacional =
      processo.percentual_disponibilidade_equipamento;

    analise[ano] = {
      processos: processo,
      avaliacao: avaliacaoResponse,
      percentual_capacidade_produtiva,
      quantidade_entregue_funcionarios,
      produtividade,
      custos_garantia,
      quantidade_giro_estoque,
      capacidade_produtiva,
      eficiencia_operacional,
      faturamento_custo_folha: produtividade,
      receita_bruta: dre.receita_bruta,
      receita_bruta_custo_folha,
      status: "success",
    };
  }
  const logInfo = `Carregando avaliação do Ambiente Interno [processos]`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    analise,
  });
};

module.exports.editarProcessos = async (event, action) => {
  const { companyId } = action;

  let _ano = "";
  if (event.queryStringParameters) {
    const { ano } = event.queryStringParameters;
    _ano = ano;
  }
  const list = _ano.split(",");
  const params = [];
  for (const item of list) {
    if (item === "") continue;
    params.push(parseInt(item, 10));
  }

  const response_list = {
    processos: [],
    ano_exercicio: [],
    funcionarios: [],
    volume_produzido_no_ano: [],
    capacidade_produzida: [],
    refugo_retrabalho: [],
    custos_garantia: [],
    entregas_no_prazo: [],
    valor_do_estoque: [],
    percentual_disponibilidade_equipamento: [],
  };

  for (const year of params) {
    const filter = {
      where: {
        ano_exercicio: year,
        EmpresaId: companyId,
      },
    };
    await Processos.findOne(filter)
      .then(async (processo) => {
        if (!processo) {
          for (const key in response_list) {
            const value = key === "ano_exercicio" ? year : null;
            response_list[key].push(value);
          }
        } else {
          response_list.processos.push(processo.id);
          response_list.ano_exercicio.push(processo.ano_exercicio);
          response_list.funcionarios.push(processo.funcionarios);
          response_list.volume_produzido_no_ano.push(
            processo.volume_produzido_no_ano
          );
          response_list.capacidade_produzida.push(
            processo.capacidade_produzida
          );
          response_list.refugo_retrabalho.push(processo.refugo_retrabalho);
          response_list.custos_garantia.push(processo.custos_garantia);
          response_list.entregas_no_prazo.push(processo.entregas_no_prazo);
          response_list.valor_do_estoque.push(processo.valor_do_estoque);
          response_list.percentual_disponibilidade_equipamento.push(
            processo.percentual_disponibilidade_equipamento
          );
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar processos", err);
        for (const key in response_list) {
          response_list[key].push(null);
        }
      });
  }

  const logInfo = `Carregando [processos] para os anos [${params}]`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    data: response_list,
  });
};

module.exports.smileCriarOuAtualizar = async (event, action) => {
  const { companyId } = action;

  const { year, smiles } = JSON.parse(event.body);
  const ano = parseInt(year, 10) - 1;

  for (const smile of Object.keys(smiles)) {
    const name = smile.replace("smile_", "");
    smiles[name] = smiles[smile];
  }

  const data = {
    EmpresaId: companyId,
    ano_exercicio: ano,
    ...smiles,
  };

  const filter = {
    where: { EmpresaId: companyId, ano_exercicio: ano },
    raw: true,
  };
  const avaliacao = await Processos_Avaliacao.findOne(filter);

  if (avaliacao) {
    await Processos_Avaliacao.update(smiles, filter);
  } else {
    await Processos_Avaliacao.create(data);
  }

  await gravarPontos(companyId, smiles, ano, "processos");

  const logInfo = `Avaliação do Ambiente Interno [processos] do ano [${
    ano + 1
  }] atualizado com sucesso`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    message: "Dados atualizados com sucesso",
  });
};

module.exports.edicaoCriarOuAtualizar = async (event, action) => {
  const { companyId } = action;

  const body = JSON.parse(event.body);
  const { year } = body;

  const data = {
    EmpresaId: companyId,
    ano_exercicio: year,
    ...body.data,
  };

  const filterProcessos = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: year,
    },
    raw: true,
  };
  const processo = await Processos.findOne(filterProcessos);

  if (processo) {
    await Processos.update(data, filterProcessos);
  } else {
    await Processos.create(data);
  }

  const logInfo = `Dados [processos] do ano [${year}] atualizados com sucesso`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    message: `Dados de Processos atualizados com sucesso`,
  });
};

module.exports.processo_detalhes = async (event, action) => {
  try {
    const { company, companyId } = event.pathParameters;
    const anos = await company.getExercises();
    const analise = {};

    for (const ano of anos) {
      const ano_analise = parseInt(ano, 10) - 1;

      const filterCompany = {
        where: { ano_exercicio: ano_analise, EmpresaId: companyId },
        raw: true,
      };

      await Processos.findOne(filterCompany)
        .then(async (result) => {
          let data = {};
          let status;

          if (result) {
            data = result;
            delete data.EmpresaId;
            delete data.createdAt;
            delete data.updatedAt;

            let receitaBruta = 0;
            let custoFolha = 0;

            await Dre.findOne(filterCompany).then((dre) => {
              receitaBruta =
                dre.receita_servico + dre.receita_produto + dre.outras_receitas;
              custoFolha = dre.despesas_com_pessoal;
            });

            status = "success";

            data.receita_bruta_custo_folha = receitaBruta / custoFolha;
            data.custo_folha = custoFolha;
            data.receita_bruta = receitaBruta;
            data.quantidade_entregue_funcionarios =
              result.volume_produzido_no_ano / result.funcionarios;
            data.custos_garantia =
              (100 / receitaBruta) * result.custos_garantia;
            data.capacidade_produtiva =
              (result.volume_produzido_no_ano / result.capacidade_produzida) *
              100;
            data.eficiencia_operacional =
              100 - result.percentual_disponibilidade_equipamento;
            data.quantidade_giro_estoque =
              receitaBruta / result.valor_do_estoque;
          } else {
            status = "fail";
            data.message =
              "Não foi possível localizar nenhuma avaliação cadastrada.";
          }

          data.status = status;
          analise[ano] = data;
        })
        .catch((err) => {
          console.info(err);
          analise[ano] = {
            status: "fatal_error",
            message: "Ocorreu um problema ao buscar os dados de avaliação.",
          };
        });
    }

    return Handler.Ok({
      status: "success",
      analise,
    });
  } catch (error) {
    console.error(error);
    return Handler.Fail({
      message: "Erro executando instruções no Servidor",
    });
  }
};

module.exports.updateEficienciaProcessos = updateEficienciaProcessos