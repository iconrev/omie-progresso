/* eslint-disable no-param-reassign */
const Handler = require("../handler");
const models = require("../../models");

const {
  Estrategias,
  Questionarios,
  Questionarios_Avaliacao,
  Objetivo_Receitas,
  Objetivo_Rentabilidade,
  Objetivo_Custos,
  Objetivo_Endividamento,
  Objetivo_Marketing,
  Objetivo_Vendas,
  Objetivo_Relacionamento,
  Objetivo_Satisfacao_Cliente,
  Objetivo_Produtividade,
  Objetivo_Qualidade,
  Objetivo_Eficiencia,
  Objetivo_Logistica,
  Objetivo_Competencia,
  Objetivo_Engajamento,
  Objetivo_Retencao,
  Objetivo_Inovacao,
  Objetivo_Estrategias,
  Objetivo_Estrategias_Comercial,
  Objetivo_Estrategias_Processos,
  Objetivo_Estrategias_Pessoas,
  Dre,
  Vendas,
  Processos,
  Pessoas,
} = models;
const { formatNumber } = require("../generico/Generic");
const BuscarMetaComercial = require("../generico/BuscarMetaComercial");
const BuscarMetaFinanceiro = require("../generico/BuscarMetaFinanceiro");

const getModels = () => ({
  Financeiro: {
    dados: Dre,
    foreignKey: "dreId",
    estrategias: Objetivo_Estrategias,
    objetivos: {
      receitas: Objetivo_Receitas,
      rentabilidade: Objetivo_Rentabilidade,
      custos: Objetivo_Custos,
      endividamento: Objetivo_Endividamento,
    },
  },
  Comercial: {
    dados: Vendas,
    foreignKey: "vendasId",
    estrategias: Objetivo_Estrategias_Comercial,
    objetivos: {
      marketing: Objetivo_Marketing,
      vendas: Objetivo_Vendas,
      relacionamento: Objetivo_Relacionamento,
      satisfacao: Objetivo_Satisfacao_Cliente,
    },
  },
  Processos: {
    dados: Processos,
    foreignKey: "processoId",
    estrategias: Objetivo_Estrategias_Processos,
    objetivos: {
      produtividade: Objetivo_Produtividade,
      qualidade: Objetivo_Qualidade,
      eficiencia: Objetivo_Eficiencia,
      logistica: Objetivo_Logistica,
    },
  },
  Pessoas: {
    dados: Pessoas,
    foreignKey: "pessoasId",
    estrategias: Objetivo_Estrategias_Pessoas,
    objetivos: {
      competencias: Objetivo_Competencia,
      engajamento: Objetivo_Engajamento,
      retencao: Objetivo_Retencao,
      inovacao: Objetivo_Inovacao,
    },
  },
});

const getQuestionarios = async () => {
  let response = [];

  const filter = {
    include: [
      {
        model: Questionarios_Avaliacao,
      },
    ],
    raw: true,
  };

  await Questionarios.findAll(filter).then((questionarios) => {
    response = questionarios;
  });

  return response;
};

const getEstrategias = async (companyId, model, perspectiva, categoria) => {
  const response = [];

  const filterCompany = {
    include: [
      {
        model: Estrategias,
        where: {
          perspectiva: perspectiva.toLowerCase(),
          categoria,
        },
      },
    ],
    where: {
      empresa_id: companyId,
    },
    order: [["descricao", "ASC"]],
    raw: true,
  };
  await model
    .findAll(filterCompany)
    .then(async (result) => {
      if (result) {
        for (let i = 0; i < result.length; i++) {
          const temp = result[i];
          delete temp.createdAt;
          delete temp["Estrategia.createdAt"];
          delete temp.updatedAt;
          delete temp["Estrategia.updatedAt"];
          delete temp["Estrategia.id"];
          delete temp.estrategia_id;
          response.push(temp);
        }
      } else {
        console.info("NADA EXIBIR");
      }
    })
    .catch((err) => {
      console.error("createQuery ->", err);
    });

  return response;
};

const createQuery = async (companyId, model, ano, perspectiva) => {
  let response;

  const tableParent = getModels()[perspectiva].dados;
  const filterParent = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: ano - 1,
    },
    raw: true,
  };
  await tableParent.findOne(filterParent).then(async (result) => {
    if (result) {
      const { id } = result;

      const { foreignKey } = getModels()[perspectiva];

      const filterCompany = {
        where: { EmpresaId: companyId, [foreignKey]: id },
        raw: true,
      };
      await model
        .findOne(filterCompany)
        .then(async (resultModel) => {
          if (resultModel) {
            delete resultModel.id;
            delete resultModel.createdAt;
            delete resultModel.updatedAt;
            delete resultModel.EmpresaId;
            response = resultModel;
          } else {
            console.info("NADA EXIBIR");
          }
        })
        .catch((err) => {
          console.error("createQuery ->", err);
        });
    } else {
      console.info("NADA EXIBIR");
    }
  });

  return response;
};

const calculaPontuacaoQuiz = (questionarios, resultados) => {
  let response = 0;
  let total = 0;

  for (let i = 0; i < questionarios.length; i++) {
    const questionario = questionarios[i];
    const avaliacao_usuario = resultados[`meta_${questionario.field}`];
    const avaliacao_labels =
      questionario["Questionarios_Avaliacao.value"].split("; ");
    const avaliacao_pontuacao = questionario.pontuacao.split("; ");

    total += parseFloat(avaliacao_pontuacao[0]);

    const index_label_avaliacao_usuario =
      avaliacao_labels.indexOf(avaliacao_usuario);
    const pontaucao_avaliacao_usuario =
      avaliacao_pontuacao[index_label_avaliacao_usuario];

    if (pontaucao_avaliacao_usuario)
      response += parseFloat(pontaucao_avaliacao_usuario);
  }

  response *= 100 / total;

  return response;
};

const responseObjetivo = (objetivo) => {
  let { descricao } = objetivo;
  const { tipo } = objetivo;

  if (tipo !== "OU") {
    const defaults = {
      CS: "Crescimento Sustentável da Receita",
      RA: "Obter Rentabilidade Adequada",
      RRC: "Racionalizar e Reduzir Custos",
      NS: "Manter endividamento em nível sustentável",
      AFM: "Aumentar fatia de mercado",
      ATX: "Aumentar taxa de conversão das propostas",
      FC: "Fidelizar Clientes",
      PVC: "Aumentar percepção de valor do cliente",
      APP: "Aumentar produtividade",
      GAQ: "Garantir altos níves de qualidade",
      AEO: "Aumentar eficiência operacional",
      OL: "Otimizar logística e estoques",
      ACO: "Aumentar competências organizacionais",
      PE: "Promover engajamento",
      RF: "Reter funcionários",
      PI: "Promover inovaçãos",
    };
    try {
      descricao = defaults[tipo];
    } catch (e) {
      console.error("CORRIGIR OBJETIVO:", tipo);
      descricao = "";
    }
  }

  return descricao;
};

const responseMetas = async (
  perspectiva,
  categoria,
  objetivo,
  questionarios,
  metas,
  company,
  ano_exercicio
) => {
  const response = [];

  const questionario_categoria = questionarios.filter(
    (obj) => obj.categoria === categoria
  );

  switch (perspectiva) {
    case "Financeiro":
      switch (categoria) {
        case "receitas":
          response.push({
            value: `${formatNumber(objetivo.percentage, 2)}%`,
            text: "Meta de aumento da Receita Bruta",
          });
          response.push({
            value: `R$ ${formatNumber(objetivo.meta, 2)}`,
            text: "Meta de Receita Bruta",
          });
          break;
        case "rentabilidade":
          response.push({
            value: `${formatNumber(objetivo.rentabilidade_percentage, 2)}%`,
            text: "Meta de Rentabilidade",
          });
          response.push({
            value: `R$ ${formatNumber(objetivo.meta_lucro, 2)}`,
            text: "Meta de EBITDA",
          });
          break;
        case "custos": {
          const objetivoCustos = await company.getObjetivoCustosByDreId(
            objetivo.dreId
          );
          const receitaBruta = metas.receitas.meta;
          const percCusto =
            (100 / receitaBruta) *
            objetivoCustos.custo_dos_produtos_industrializados;
          const despesas = objetivoCustos.despesas_total;
          const percDespesas = (100 / receitaBruta) * despesas;

          response.push({
            value: `${formatNumber(percCusto, 2)} %`,
            text: "Meta de Custos de Mercadorias Vendidas",
          });
          response.push({
            value: `${formatNumber(percDespesas, 2)} %`,
            text: "Meta de Despesas sobre o faturamento Bruto",
          });
          break;
        }
        case "endividamento":
          response.push({
            value: `${formatNumber(objetivo.meta_reducao_divida, 2)}%`,
            text: "Meta de Redução da Dívida",
          });
          response.push({
            value: `${formatNumber(objetivo.meta_reducao_inadimplencia, 2)}%`,
            text: "Meta de Inadimplência Mensal",
          });
          break;
        default:
          console.error("CATEGORIA NÃO EnCONTRADA:", categoria);
      }
      break;
    case "Comercial":
      switch (categoria) {
        case "marketing":
          response.push({
            value: `${formatNumber(objetivo.clientes_ativos_previsto, 0)}`,
            text: "Meta de Clientes Ativos",
          });
          response.push({
            value: `${formatNumber(objetivo.clientes_novos_previsto, 0)}`,
            text: "Meta de Novos Clientes",
          });
          break;
        case "vendas": {
          response.push({
            value: `${formatNumber(objetivo.meta_taxa_conversao_prevista, 2)}%`,
            text: "Meta de Conversão de Propostas",
          });
          const metaComercialVendas =
            await BuscarMetaComercial.buscarMetaMarketing(
              company,
              ano_exercicio - 1
            );
          if (metaComercialVendas) {
            response.push({
              value: `R$ ${formatNumber(
                metaComercialVendas.ticket_medio_previsto,
                2
              )}`,
              text: "Meta de Ticket Médio",
            });
          }
          break;
        }
        case "relacionamento": {
          response.push({
            value: `${formatNumber(
              objetivo.meta_clientes_fidelizados_previsto,
              0
            )}`,
            text: "Meta de Clientes Fidelizados",
          });
          const relacionamento = calculaPontuacaoQuiz(
            questionario_categoria,
            objetivo
          );
          response.push({
            value: `${formatNumber(relacionamento, 2)}%`,
            text: "Meta de Nível de Relacionamento",
          });
          break;
        }
        case "satisfacao": {
          response.push({
            value: `${formatNumber(objetivo.meta_reclamacao_nf_previsto, 2)}%`,
            text: "Meta de Reclamações Recebidas",
          });
          const metaComercialSatisfacao =
            await BuscarMetaComercial.buscarMetaMarketing(
              company,
              ano_exercicio - 1
            );
          if (metaComercialSatisfacao) {
            response.push({
              value: `${formatNumber(
                metaComercialSatisfacao.clientes_perdidos_previsto,
                0
              )}`,
              text: "Meta Clientes Perdidos",
            });
          }
          break;
        }
        default:
          console.error("CATEGORIA NÃO EnCONTRADA:", categoria);
      }
      break;
    case "Processos":
      switch (categoria) {
        case "produtividade": {
          const metaFinanceiroProdutividade =
            await BuscarMetaFinanceiro.buscarMetaFinanceiro(
              company,
              ano_exercicio - 1
            );

          if (metaFinanceiroProdutividade) {
            const metaReceita = metaFinanceiroProdutividade.meta;
            const gastosPessoal = metaFinanceiroProdutividade.despesas_com_pessoal;
            response.push({
              value: `R$ ${formatNumber(metaReceita / gastosPessoal, 2)}`,
              text: "Meta Receita Bruta / Custo de Pessoal",
            });
            response.push({
              value: `${formatNumber(
                objetivo.quantidade_entregue_funcionarios_previsto,
                2
              )}`,
              text: "Meta de Entregas por Funcionários",
            });
          }
          break;
        }
        case "qualidade":
          response.push({
            value: `${formatNumber(objetivo.refugo_retrabalho_previsao, 2)}%`,
            text: "Meta de Refugo / Retrabalho",
          });
          response.push({
            value: `${formatNumber(objetivo.custos_garantia_previsao, 2)}%`,
            text: "Meta de Custos Garantia / Faturamento",
          });
          break;
        case "eficiencia":
          response.push({
            value: `${formatNumber(
              objetivo.capacidade_produtiva_previsao,
              2
            )}%`,
            text: "Meta de Capacidade Produtiva",
          });
          response.push({
            value: `${formatNumber(objetivo.eficiencia_previsao, 2)}%`,
            text: "Meta de Eficiência Operacional",
          });
          break;
        case "logistica":
          response.push({
            value: `${formatNumber(objetivo.entrega_prazo_previsao, 2)}%`,
            text: "Meta de Entregas no Prazo",
          });
          response.push({
            value: `R$ ${formatNumber(objetivo.valor_estoque_previsao, 2)}`,
            text: "Meta de Valor de Estoque",
          });
          response.push({
            value: `${formatNumber(objetivo.giro_estoque_previsao, 2)}`,
            text: "Previsão de Giro de Estoque",
          });
          break;
        default:
          console.error("CATEGORIA NÃO EnCONTRADA:", categoria);
      }
      break;
    case "Pessoas":
      switch (categoria) {
        case "competencias": {
          const competencias = calculaPontuacaoQuiz(
            questionario_categoria,
            objetivo
          );
          response.push({
            value: `${formatNumber(competencias, 2)}%`,
            text: "Meta de Competências Atuais/Requeridas",
          });
          break;
        }
        case "engajamento": {
          response.push({
            value: `${formatNumber(objetivo.absenteismo_meta, 2)}%`,
            text: "Meta de Absenteísmo",
          });
          const engajamento = calculaPontuacaoQuiz(
            questionario_categoria,
            objetivo
          );
          if (engajamento) {
            response.push({
              value: `${formatNumber(engajamento, 2)}%`,
              text: "Meta de Nível de Engajamento",
            });
          }
          break;
        }
        case "retencao": {
          const retencao = calculaPontuacaoQuiz(
            questionario_categoria,
            objetivo
          );
          if (retencao) {
            response.push({
              value: `${formatNumber(objetivo.rotatividade_meta, 2)}%`,
              text: "Meta de Rotatividade",
            });
            response.push({
              value: `${formatNumber(objetivo.funcionarios_antigos_meta, 2)}%`,
              text: "Meta de Funcionários > 12 meses",
            });
            response.push({
              value: `${formatNumber(retencao, 2)}%`,
              text: "Meta de Nível de Retenção",
            });
          }
          break;
        }
        case "inovacao":
          response.push({
            value: `${formatNumber(objetivo.inovacao_previsao, 0)}`,
            text: "Meta de Inovações",
          });
          response.push({
            value: `${formatNumber(
              objetivo.faturamento_gasto_inovacao_meta,
              2
            )}%`,
            text: "Meta de Faturamento",
          });
          break;
        default:
          console.error("CATEGORIA NÃO EnCONTRADA:", categoria);
      }
      break;
    default:
      console.error("PERSPECTIVA NAO ENCONTRADA:", perspectiva);
  }

  return response;
};

const findResults = async (company, ano) => {
  const companyId = company.id;
  const result = {};

  const tables = getModels();

  const questionarios = await getQuestionarios();

  const promises = Object.keys(tables).map(async (perspectiva) => {
    // const promises = ["Financeiro"].map(async (perspectiva) => {
    const table_estrategia = tables[perspectiva].estrategias;
    const tables_perspectiva = tables[perspectiva].objetivos;
    const todas_metas = {};

    const promisesCategoria = Object.keys(tables_perspectiva).map(
      async (categoria) => {
        const table = tables_perspectiva[categoria];
        const found = await createQuery(companyId, table, ano, perspectiva);

        const response = {};
        if (found !== undefined) {
          todas_metas[categoria] = found;
          response.objetivo = responseObjetivo(found);
          const promisesMetasEstrategias = [];
          promisesMetasEstrategias.push(
            responseMetas(
              perspectiva,
              categoria,
              found,
              questionarios,
              todas_metas,
              company,
              ano
            )
          );
          promisesMetasEstrategias.push(
            getEstrategias(companyId, table_estrategia, perspectiva, categoria)
          );
          const [metas, estrategias] = await Promise.all(
            promisesMetasEstrategias
          );

          response.metas = metas;
          response.estrategias = estrategias;
        } else {
          response.objetivo = "Não definido";
          response.metas = [];
          response.estrategias = [];
        }

        result[perspectiva] = {
          ...result[perspectiva],
          [categoria]: response,
        };
      }
    );

    await Promise.all(promisesCategoria);
  });

  await Promise.all(promises);

  return result;
};

module.exports.buscarDados = async (event, action) => {
  const { company } = action;
  const anos = await company.getExercises();
  const analise = {};

  const run = async (ano) => {
    analise[ano] = await findResults(company, ano);
  };

  const promises = anos.map((ano) => run(ano));

  await Promise.all(promises);

  return Handler.Ok({
    analise,
  });
};
