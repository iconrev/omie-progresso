const Handler = require("../../handler");
const models = require("../../../models");
const Filtro = require("../../../generico/FiltrarAnoEmpresa");
const Dre_Source = require("./dre");

const { Dre, Vendas, Vendas_Avaliacao } = models;
const { gravarPontos } = require("./swot");
const AnoExercicioEmpresa = require("../../generico/AnoExercicioEmpresa");
const Logger = require("../../../auth/logService");

function calcular_pontos(value) {
  if (value) {
    if (value.includes("MuitoBom")) {
      return 5;
    }
    if (value.includes("Bom")) {
      return 3.5;
    }
    if (value.includes("Deficiente")) {
      return 1.5;
    }
    if (value.includes("NaoTem")) {
      return 0.5;
    }
    return 0.0;
  }
  return 0.0;
}

const calcula_smile_points = (smile) => {
  if (smile) {
    if (smile.includes("Bom")) {
      // return 12;
      return 3;
    }
    if (smile.includes("Neutro")) {
      return 2;
      // return 6;
    }
    if (smile.includes("Ruim")) {
      return 1;
    }
  }
  return 0;
};

const updateEficienciaComercial = async (
  companyId,
  // eslint-disable-next-line default-param-last
  ano_definido = null,
  avaliacao
) => {
  // obtem o ano disponível para análise
  let ano_exercicio = 0;

  if (ano_definido) {
    ano_exercicio = parseInt(ano_definido, 10) - 1;
  } else {
    await Filtro.ultimo_ano_exercicio(Vendas, companyId).then((ano) => {
      ano_exercicio = ano;
    });
  }

  let total_smile_points = 0.0;
  let porcentagem_vendas = 0.0;

  // obteve algum lançamento?
  if (ano_exercicio > 0) {
    await Vendas.findOne({
      where: { EmpresaId: companyId, ano_exercicio },
      raw: true,
    })
      .then(async (vendas) => {
        if (vendas) {
          // objetivo receitas
          await Vendas_Avaliacao.findOne({
            where: { EmpresaId: companyId, ano_exercicio },
          })
            .then(async (avaliacao) => {
              total_smile_points += calcula_smile_points(
                avaliacao.percentual_clientes_ativos
              );
              total_smile_points += calcula_smile_points(
                avaliacao.novos_clientes_no_ano
              );
              total_smile_points += calcula_smile_points(
                avaliacao.taxa_conversao
              );
              total_smile_points += calcula_smile_points(
                avaliacao.ticket_medio
              );
              total_smile_points += calcula_smile_points(
                avaliacao.clientes_fidelizados
              );
              total_smile_points += calcula_smile_points(
                avaliacao.nivel_relacionamento_clientes
              );
              total_smile_points += calcula_smile_points(
                avaliacao.clientes_perdidos
              );
              total_smile_points += calcula_smile_points(
                avaliacao.taxa_reclamacao_nf
              );

              // eram 11 indiacadores...., agora são 8
              if (total_smile_points > 0) {
                const pontos_maximos = 8 * 3;
                porcentagem_vendas =
                  (total_smile_points / pontos_maximos) * 100;
              }
            })
            .catch((analise_objetivo_err) => {
              console.error(analise_objetivo_err);
            });
        }
      })
      .catch((objetivo_receita_err) => {
        console.info(objetivo_receita_err);
      });
  }

  // faz atualização do resumo interno
  await Dre_Source.atualizar_resumo(
    companyId,
    ano_exercicio,
    porcentagem_vendas,
    "comercial"
  );

  // return {
  //   'ano_exercicio': ano_exercicio,
  //   'total_smile_points': total_smile_points,
  //   'porcentagem_vendas': porcentagem_vendas,
  // }
  avaliacao[ano_definido] = {
    ano: ano_exercicio,
    percentual: porcentagem_vendas,
  };
};

module.exports.gauge = async (event, action) => {
  const { companyId } = action;
  const anos = await AnoExercicioEmpresa.getAll(companyId);
  const avaliacao = {};

  const promises = anos.map((ano) =>
    updateEficienciaComercial(companyId, ano, avaliacao)
  );
  await Promise.all(promises);

  return Handler.Ok({
    avaliacao,
  });
};

module.exports.avaliacaoSmile = async (event, action) => {
  const { companyId, company } = action;

  const anos = await company.getExercises(companyId);
  const analise = {};

  for (const ano of anos) {
    const ano_analise = ano - 1;
    const dre = await company.getDreByYear(ano_analise);

    if (!dre) {
      analise[ano] = {
        status: "dre_not_found",
        message: `DRE ${ano - 1} não preenchido.`,
      };
      continue;
    }

    const vendas = await company.getCommercialByYear(ano_analise);

    if (!vendas) {
      analise[ano] = {
        status: "diagnostic_not_found",
        message: `Não há Análise de Desempenho de Vendas para o ano de ${ano_analise}.`,
      };
      continue;
    }

    const ticket_medio = (dre.inputs.receita_bruta) / vendas.notas_fiscais_emitidas;
    const percentual_clientes_ativos = (vendas.carteira_de_clientes_ativa / vendas.base_clientes) * 100;
    const taxa_reclamacao_nf = (vendas.reclamacoes_clientes / vendas.notas_fiscais_emitidas) * 100;
    const taxa_conversao = (vendas.propostas_aprovadas_no_ano / vendas.propostas_enviadas_no_ano) * 100;
    const percentual_clientes_fidelizados = (vendas.clientes_fidelizados / vendas.carteira_de_clientes_ativa) * 100;

    const calculo_1 = calcular_pontos(vendas.processos_politica_relacionamento_cliente);
    const calculo_2 = calcular_pontos(vendas.canais_comunicacao_estruturado);
    const calculo_3 = calcular_pontos(vendas.equipe_treinada_para_relacionamento);
    const calculo_4 = calcular_pontos(vendas.execucao_plano_relacionamento);
    const calculo_5 = calcular_pontos(vendas.atuacao_demanda_identificadas);
    vendas.nivel_relacionamento_clientes = ((calculo_1 + calculo_2 + calculo_3 + calculo_4 + calculo_5) / 25) * 100;

    const avaliacao = await Vendas_Avaliacao.findOne({
      where: { EmpresaId: companyId, ano_exercicio: ano_analise },
      raw: true,
    });
    const avaliacaoResponse = avaliacao
      ? {
          smile_percentual_clientes_ativos:
            avaliacao.percentual_clientes_ativos || "NaoAvaliado",
          smile_novos_clientes_no_ano:
            avaliacao.novos_clientes_no_ano || "NaoAvaliado",
          smile_taxa_conversao: avaliacao.taxa_conversao || "NaoAvaliado",
          smile_ticket_medio: avaliacao.ticket_medio || "NaoAvaliado",
          smile_clientes_fidelizados:
            avaliacao.clientes_fidelizados || "NaoAvaliado",
          smile_nivel_relacionamento_clientes:
            avaliacao.nivel_relacionamento_clientes || "NaoAvaliado",
          smile_clientes_perdidos: avaliacao.clientes_perdidos || "NaoAvaliado",
          smile_taxa_reclamacao_nf:
            avaliacao.taxa_reclamacao_nf || "NaoAvaliado",
        }
      : {
          smile_percentual_clientes_ativos: "NaoAvaliado",
          smile_novos_clientes_no_ano: "NaoAvaliado",
          smile_taxa_conversao: "NaoAvaliado",
          smile_ticket_medio: "NaoAvaliado",
          smile_clientes_fidelizados: "NaoAvaliado",
          smile_nivel_relacionamento_clientes: "NaoAvaliado",
          smile_clientes_perdidos: "NaoAvaliado",
          smile_taxa_reclamacao_nf: "NaoAvaliado",
        };

    analise[ano] = {
      vendas,
      avaliacao: avaliacaoResponse,
      ticket_medio,
      percentual_clientes_ativos,
      taxa_reclamacao_nf,
      taxa_conversao,
      percentual_clientes_fidelizados,
      status: "success",
    };
  }

  const logInfo = `Carregando avaliação do Ambiente Interno [comercial]`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    analise,
  });
};

module.exports.editarVendas = async (event, action) => {
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
    params.push(item);
  }

  const response_list = {
    id: [],
    ano_exercicio: [],
    carteira_de_clientes_ativa: [],
    novos_clientes_no_ano: [],
    propostas_enviadas_no_ano: [],
    propostas_aprovadas_no_ano: [],
    notas_fiscais_emitidas: [],
    clientes_fidelizados: [],
    reclamacoes_clientes: [],
    clientes_perdidos: [],
    base_clientes: [],
    nivel_relacionamento_clientes: [],
    tipo_relacionamento_clientes: [],
    // novos campos
    processos_politica_relacionamento_cliente: [],
    canais_comunicacao_estruturado: [],
    equipe_treinada_para_relacionamento: [],
    execucao_plano_relacionamento: [],
    atuacao_demanda_identificadas: [],
  };

  for (const year of params) {
    const filter = {
      where: {
        ano_exercicio: year,
        EmpresaId: companyId,
      },
    };
    await Vendas.findOne(filter)
      .then(async (venda) => {
        if (!venda) {
          for (const key in response_list) {
            const value = key === "ano_exercicio" ? year : null;
            response_list[key].push(value);
          }
        } else {
          response_list.id.push(venda.id);
          response_list.ano_exercicio.push(venda.ano_exercicio);
          response_list.carteira_de_clientes_ativa.push(
            venda.carteira_de_clientes_ativa
          );
          response_list.novos_clientes_no_ano.push(venda.novos_clientes_no_ano);
          response_list.propostas_enviadas_no_ano.push(
            venda.propostas_enviadas_no_ano
          );
          response_list.propostas_aprovadas_no_ano.push(
            venda.propostas_aprovadas_no_ano
          );
          response_list.notas_fiscais_emitidas.push(
            venda.notas_fiscais_emitidas
          );
          response_list.clientes_fidelizados.push(venda.clientes_fidelizados);
          response_list.reclamacoes_clientes.push(venda.reclamacoes_clientes);
          response_list.clientes_perdidos.push(venda.clientes_perdidos);
          response_list.base_clientes.push(venda.base_clientes);
          response_list.nivel_relacionamento_clientes.push(
            venda.nivel_relacionamento_clientes
          );
          response_list.tipo_relacionamento_clientes.push(
            venda.tipo_relacionamento_clientes
          );
          response_list.processos_politica_relacionamento_cliente.push(
            venda.processos_politica_relacionamento_cliente
          );
          response_list.canais_comunicacao_estruturado.push(
            venda.canais_comunicacao_estruturado
          );
          response_list.equipe_treinada_para_relacionamento.push(
            venda.equipe_treinada_para_relacionamento
          );
          response_list.execucao_plano_relacionamento.push(
            venda.execucao_plano_relacionamento
          );
          response_list.atuacao_demanda_identificadas.push(
            venda.atuacao_demanda_identificadas
          );
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar comercial", err);
        for (const key in response_list) {
          response_list[key].push(null);
        }
      });
  }

  const logInfo = `Carregando [comercial] para os anos [${params}]`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    data: response_list,
  });
};

module.exports.criarOuAtualizar = async (event, action) => {
  const { companyId } = action;

  const body = JSON.parse(event.body);
  const { year } = body;

  const data = {
    EmpresaId: companyId,
    ano_exercicio: year,
    ...body.data,
  };

  const filterVendas = {
    where: { EmpresaId: companyId, ano_exercicio: year },
    raw: true,
  };
  const vendas = await Vendas.findOne(filterVendas);

  if (vendas) {
    await Vendas.update(data, filterVendas);
  } else {
    await Vendas.create(data);
  }

  const logInfo = `Dados [comercial] do ano [${year}] atualizados com sucesso`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    message: `Comercial atualizados com sucesso`,
  });
};

module.exports.avaliacaoCriaOrAtualizar = async (event, action) => {
  const { companyId } = action;

  const { year, smiles } = JSON.parse(event.body);
  const ano = parseInt(year) - 1;

  for (const smile of Object.keys(smiles)) {
    const name = smile.replace("smile_", "");
    smiles[name] = smiles[smile];
  }

  const data = {
    EmpresaId: companyId,
    ano_exercicio: ano,
    ...smiles,
  };

  const filterAvaliacao = {
    where: { EmpresaId: companyId, ano_exercicio: ano },
    raw: true,
  };
  const avaliacao = await Vendas_Avaliacao.findOne(filterAvaliacao);
  if (avaliacao) {
    await Vendas_Avaliacao.update(smiles, filterAvaliacao);
  } else {
    await Vendas_Avaliacao.create(data);
  }

  await gravarPontos(companyId, smiles, ano, "comercial");

  const logInfo = `Avaliação do Ambiente Interno [comercial] do ano [${
    ano + 1
  }] atualizado com sucesso`;
  await Logger.setSuccessLog(action, logInfo);

  return Handler.Ok({
    message: "Dados atualizados com sucesso",
  });
};

module.exports.vendas_detalhes = async (event, action) => {
  const { companyId } = action;
  const anos = await AnoExercicioEmpresa.getAll(companyId);
  const analise = {};

  for (const ano of anos) {
    const ano_analise = parseInt(ano) - 1;

    const filterCompany = {
      where: { ano_exercicio: ano_analise, EmpresaId: companyId },
      raw: true,
    };

    await Vendas.findOne(filterCompany)
      .then(async (result) => {
        const data = {};
        let status;

        if (result) {
          data.vendas_id = result.id;
          data.percentual_clientes_ativos =
            (result.carteira_de_clientes_ativa / result.base_clientes) * 100;
          data.novos_clientes_no_ano = result.novos_clientes_no_ano ;
          data.taxa_conversao =
            (result.propostas_aprovadas_no_ano /
              result.propostas_enviadas_no_ano) *
            100;

          await Dre.findOne(filterCompany).then((dre) => {
            const receita_bruta =
              dre.receita_servico + dre.receita_produto + dre.outras_receitas;
            data.ticket_medio = receita_bruta / result.notas_fiscais_emitidas;
          });

          data.percentual_clientes_fidelizados =
            (result.clientes_fidelizados / result.carteira_de_clientes_ativa) *
            100;

          const calculo_1 = calcular_pontos(
            result.processos_politica_relacionamento_cliente
          );
          const calculo_2 = calcular_pontos(
            result.canais_comunicacao_estruturado
          );
          const calculo_3 = calcular_pontos(
            result.equipe_treinada_para_relacionamento
          );
          const calculo_4 = calcular_pontos(
            result.execucao_plano_relacionamento
          );
          const calculo_5 = calcular_pontos(
            result.atuacao_demanda_identificadas
          );

          data.nivel_relacionamento_clientes =
            ((calculo_1 + calculo_2 + calculo_3 + calculo_4 + calculo_5) / 25) *
            100;
          data.clientes_perdidos = result.clientes_perdidos;
          data.taxa_reclamacao_nf =
            (result.reclamacoes_clientes / result.notas_fiscais_emitidas) * 100;

          await Vendas_Avaliacao.findOne(filterCompany).then((smile) => {
            const smiles = smile;
            delete smiles.id;
            delete smiles.EmpresaId;
            delete smiles.createdAt;
            delete smiles.updatedAt;
            data.smiles = smiles;
          });

          data.notas_fiscais_emitidas = result.notas_fiscais_emitidas;
          data.carteira_de_clientes_ativa = result.carteira_de_clientes_ativa;
          data.base_clientes = result.base_clientes;
          data.propostas_enviadas_no_ano = result.propostas_enviadas_no_ano;
          data.propostas_aprovadas_no_ano = result.propostas_aprovadas_no_ano;
          data.clientes_fidelizados = result.clientes_fidelizados;
          data.reclamacoes_clientes = result.reclamacoes_clientes;

          data.processos_politica_relacionamento_cliente =
            result.processos_politica_relacionamento_cliente;
          data.canais_comunicacao_estruturado =
            result.canais_comunicacao_estruturado;
          data.equipe_treinada_para_relacionamento =
            result.equipe_treinada_para_relacionamento;
          data.execucao_plano_relacionamento =
            result.execucao_plano_relacionamento;
          data.atuacao_demanda_identificadas =
            result.atuacao_demanda_identificadas;

          status = "success";
        } else {
          status = "data_not_found";
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
    analise,
  });
};

module.exports.calcular_pontos = calcular_pontos
module.exports.updateEficienciaComercial = updateEficienciaComercial
