/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
const Handler = require("./handler");
const models = require("../models");

const { Vendas } = models;
const {
  LimiteDeEstrategias,
  SalvarAtualizarEstrategias,
  getEstrategiasDisponiveis,
  getEstrategiasCadastradas,
} = require("./generico/FuncoesDeEstrategias");
const { ConvertStringToFloat } = require("./generico/ConvertStringToFloat");
const { buscarMetaFinanceiro } = require("./generico/BuscarMetaFinanceiro");
const {
  SuggestionIncrease,
  SuggestionRule,
} = require("./generico/SuggestionRule");
const getModel = require("./generico/GetModel");
const { getQuiz } = require("./generico/FuncoesDeQuestionarios");
const userController = require("../auth/userController");

const getObjectives = (categoria, result) => {
  console.info("Buscando outros objetivos e sugestões");

  const objetivos = {
    marketing: {
      ticket_medio_previsto: result.ticket_medio_previsto,
      meta_ticket_medio: result.meta_ticket_medio,
      clientes_ativos_previsto: result.clientes_ativos_previsto,
      meta_clientes_ativos: result.meta_clientes_ativos,
      clientes_perdidos_previsto: result.clientes_perdidos_previsto,
      meta_clientes_perdidos: result.meta_clientes_perdidos,
      clientes_ativos_corrente: result.clientes_ativos_corrente,
      clientes_novos_previsto: result.clientes_novos_previsto,
      base_clientes_previsto: result.base_clientes_previsto,
    },
    vendas: {
      meta_taxa_conversao: result.meta_taxa_conversao,
      meta_taxa_conversao_prevista: result.meta_taxa_conversao_prevista,
    },
    relacionamento: {
      meta_clientes_fidelizados: result.meta_clientes_fidelizados,
      meta_nivel_relacionamento: result.meta_nivel_relacionamento,
      meta_processos_politica_relacionamento_cliente:
        result.meta_processos_politica_relacionamento_cliente,
      meta_canais_comunicacao_estruturado:
        result.meta_canais_comunicacao_estruturado,
      meta_equipe_treinada_para_relacionamento:
        result.meta_equipe_treinada_para_relacionamento,
      meta_execucao_plano_relacionamento:
        result.meta_execucao_plano_relacionamento,
      meta_atuacao_demanda_identificadas:
        result.meta_atuacao_demanda_identificadas,
    },
    satisfacao: {
      meta_reclamacao_nf: result.meta_reclamacao_nf,
    },
  };
  objetivos[categoria].vendasId = result.vendasId;
  objetivos[categoria].tipo = result.tipo;
  objetivos[categoria].descricao = result.descricao;
  return objetivos[categoria];
};

const getOtherObjectives = async (
  perspectiva,
  categoria,
  filterCompany,
  meta_receitas,
  objetivos_categoria,
  ano_exercicio
) => {
  const empresaId = filterCompany.where.EmpresaId;
  const ano = ano_exercicio - 1;

  let objetivos;
  let model;

  if (categoria === "marketing") {
    objetivos = {
      ...objetivos,
      meta_crescimento_receita_percentual: meta_receitas.percentage,
      meta_crescimento_receita_valor: meta_receitas.meta,
    };

    const sugestao_ticket_medio_clientes_percentual =
      meta_receitas.percentage * 0.6;
    objetivos.sugestao_ticket_medio_clientes_percentual =
      sugestao_ticket_medio_clientes_percentual;

    await userController
      .raw_query(
        `
            SELECT 
                Dre.ano_exercicio,
                (Dre.receita_produto + Dre.receita_servico + Dre.outras_receitas) as receita_bruta_anterior,
                ((Dre.receita_produto + Dre.receita_servico + Dre.outras_receitas) / Vendas.carteira_de_clientes_ativa) as ticket_medio_clientes,
                ((Dre.receita_produto + Dre.receita_servico + Dre.outras_receitas) / Vendas.notas_fiscais_emitidas) as ticket_medio_notas,
                (Vendas.propostas_aprovadas_no_ano / Vendas.propostas_enviadas_no_ano * 100) as taxa_conversao,
                Vendas.carteira_de_clientes_ativa,
                (Vendas.clientes_perdidos / Vendas.carteira_de_clientes_ativa * 100) as percentual_clientes_perdidos
            FROM 
                Dre
                inner join Vendas on Dre.EmpresaId = Vendas.EmpresaId and Dre.ano_exercicio = Vendas.ano_exercicio        
            WHERE
                Dre.EmpresaId = :empresaId and Dre.ano_exercicio = :ano`,
        { empresaId, ano }
      )
      .then((result) => {
        if (result) {
          const dados = result[0];
          const ticket_meio_clientes = dados.ticket_medio_clientes;
          const sugestao_ticket_medio_clientes_valor =
            (1 + sugestao_ticket_medio_clientes_percentual / 100) *
            ticket_meio_clientes;
          objetivos.sugestao_ticket_medio_clientes_valor =
            sugestao_ticket_medio_clientes_valor;
          const receita_bruta_prevista =
            objetivos.meta_crescimento_receita_valor;
          const sugestao_clientes_ativos_valor =
            receita_bruta_prevista / sugestao_ticket_medio_clientes_valor;
          objetivos.sugestao_clientes_ativos_valor =
            sugestao_clientes_ativos_valor;
          const sugestao_clientes_correntes_valor =
            dados.carteira_de_clientes_ativa;
          objetivos.sugestao_clientes_correntes_valor =
            sugestao_clientes_correntes_valor;
          objetivos.sugestao_clientes_ativos_percentual =
            ((sugestao_clientes_ativos_valor -
              sugestao_clientes_correntes_valor) /
              sugestao_clientes_correntes_valor) *
            100;
          const sugestao_clientes_perdidos_percentual =
            dados.percentual_clientes_perdidos * 0.6;
          objetivos.sugestao_clientes_perdidos_percentual =
            sugestao_clientes_perdidos_percentual;
          const sugestao_clientes_perdidos_valor =
            (sugestao_clientes_perdidos_percentual *
              sugestao_clientes_correntes_valor) /
            100;
          objetivos.sugestao_clientes_perdidos_valor =
            sugestao_clientes_perdidos_valor;
          objetivos.sugestao_novos_clientes_valor =
            sugestao_clientes_ativos_valor -
            sugestao_clientes_correntes_valor +
            sugestao_clientes_perdidos_valor;
        }
      });
  }
  if (categoria === "vendas" || categoria === "marketing") {
    model = await getModel.byCategory("marketing");
    await model.findOne(filterCompany).then(async (result) => {
      if (result) {
        objetivos = {
          ...objetivos,
          ...{
            meta_clientes_ativos: result.meta_clientes_ativos,
            meta_novos_clientes: result.meta_novos_clientes,
            base_clientes_previsto: result.base_clientes_previsto,
            clientes_ativos_previsto: result.clientes_ativos_previsto,
            novos_clientes_previsto: result.novos_clientes_previsto,
          },
        };
      }
    });
    await userController
      .raw_query(
        `
            SELECT 
                Dre.ano_exercicio,
                (Dre.receita_produto + Dre.receita_servico + Dre.outras_receitas) as receita_bruta_anterior,
                ((Dre.receita_produto + Dre.receita_servico + Dre.outras_receitas) / Vendas.carteira_de_clientes_ativa) as ticket_medio_clientes,
                ((Dre.receita_produto + Dre.receita_servico + Dre.outras_receitas) / Vendas.notas_fiscais_emitidas) as ticket_medio_notas,
                (Vendas.propostas_aprovadas_no_ano / Vendas.propostas_enviadas_no_ano * 100) as taxa_conversao
            FROM 
                Dre
                inner join Vendas on Dre.EmpresaId = Vendas.EmpresaId and Dre.ano_exercicio = Vendas.ano_exercicio        
            WHERE
                Dre.EmpresaId = :empresaId and Dre.ano_exercicio = :ano`,
        { empresaId, ano }
      )
      .then((result) => {
        if (result) {
          objetivos = {
            ...result[0],
            ...objetivos,
          };
        }
      });

    if (categoria === "vendas") {
      const taxaAtual = parseFloat(objetivos.taxa_conversao);
      objetivos.sugestao_taxa_conversao = SuggestionRule(taxaAtual);
    }
  }
  if (categoria === "relacionamento" || categoria === "satisfacao") {
    model = await getModel.byCategory("marketing");
    await model.findOne(filterCompany).then(async (result) => {
      if (result) {
        objetivos = {
          meta_clientes_ativos: result.meta_clientes_ativos,
          meta_novos_clientes: result.meta_novos_clientes,
          base_clientes_previsto: result.base_clientes_previsto,
          clientes_ativos_previsto: result.clientes_ativos_previsto,
          novos_clientes_previsto: result.novos_clientes_previsto,
        };
      }
    });
    if (categoria === "relacionamento") {
      objetivos.sugestao_clientes_fidelizados = SuggestionIncrease();
    }
  }
  if (categoria === "satisfacao") {
    objetivos.sugestao_reclamacao_nf = SuggestionIncrease();
  }

  return objetivos;
};

const cleanFields = (categoria, objetivo, companyId) => {
  objetivo.EmpresaId = companyId;

  const { quiz } = objetivo;
  const quizClean = [];
  if (quiz) {
    quiz.forEach((item) => {
      objetivo[`meta_${item.field}`] = item.meta_avaliacao;

      const estrategia_id = item.estrategia_escolhida_id;
      const estrategia_label = item.estrategia_escolhida_label;

      if (estrategia_id !== null && estrategia_label !== null) {
        quizClean.push({
          value: estrategia_id,
          descricao: estrategia_label,
          field: item.field,
        });
      }
    });
    delete objetivo.quiz;
  }

  if (categoria === "marketing") {
    objetivo.ticket_medio_previsto = ConvertStringToFloat(
      objetivo.ticket_medio_previsto
    );
    objetivo.meta_ticket_medio = ConvertStringToFloat(
      objetivo.meta_ticket_medio
    );
    objetivo.clientes_ativos_previsto = ConvertStringToFloat(
      objetivo.clientes_ativos_previsto
    );
    objetivo.meta_clientes_ativos = ConvertStringToFloat(
      objetivo.meta_clientes_ativos
    );
    objetivo.clientes_perdidos_previsto = ConvertStringToFloat(
      objetivo.clientes_perdidos_previsto
    );
    objetivo.meta_clientes_perdidos = ConvertStringToFloat(
      objetivo.meta_clientes_perdidos
    );
    objetivo.clientes_ativos_corrente = ConvertStringToFloat(
      objetivo.clientes_ativos_corrente
    );
    objetivo.clientes_novos_previsto = ConvertStringToFloat(
      objetivo.clientes_novos_previsto
    );
    objetivo.base_clientes_previsto = ConvertStringToFloat(
      objetivo.base_clientes_previsto
    );
  }
  if (categoria === "vendas") {
    objetivo.meta_taxa_conversao = ConvertStringToFloat(
      objetivo.meta_taxa_conversao
    );
    objetivo.meta_taxa_conversao_prevista = ConvertStringToFloat(
      objetivo.meta_taxa_conversao_prevista
    );
  }
  if (categoria === "relacionamento") {
    objetivo.meta_clientes_fidelizados = ConvertStringToFloat(
      objetivo.meta_clientes_fidelizados
    );
    objetivo.meta_clientes_fidelizados_previsto = ConvertStringToFloat(
      objetivo.meta_clientes_fidelizados_previsto
    );
  }
  if (categoria === "satisfacao") {
    objetivo.meta_clientes_perdidos = ConvertStringToFloat(
      objetivo.meta_clientes_perdidos
    );
    objetivo.meta_clientes_perdidos_previsto = ConvertStringToFloat(
      objetivo.meta_clientes_perdidos_previsto
    );
    objetivo.meta_reclamacao_nf = ConvertStringToFloat(
      objetivo.meta_reclamacao_nf
    );
    objetivo.meta_reclamacao_nf_previsto = ConvertStringToFloat(
      objetivo.meta_reclamacao_nf_previsto
    );
  }

  return {
    objetivoClean: objetivo,
    quiz: quizClean,
  };
};

module.exports.salvarMeta = async (event, action) => {
  const { companyId } = action;
  const { perspectiva, categoria } = event.pathParameters;

  const model = await getModel.byCategory(categoria);
  if (model === undefined) {
    return Handler.Error({
      message: `Categoria desconhecida`,
    });
  }

  // eslint-disable-next-line prefer-const
  let { objetivo, estrategias } = JSON.parse(event.body);
  const { objetivoClean, quiz } = cleanFields(categoria, objetivo, companyId);

  if (estrategias === undefined) {
    estrategias = quiz;
  }

  const queryEmpresa = {
    where: {
      EmpresaId: companyId,
      vendasId: objetivo.vendasId,
    },
    raw: true,
  };
  const result = await model.findOne(queryEmpresa);
  if (result) {
    await model.update(objetivoClean, queryEmpresa);
  } else {
    await model.create(objetivoClean);
  }

  await SalvarAtualizarEstrategias(
    perspectiva,
    categoria,
    estrategias,
    companyId,
    objetivo.vendasId
  );

  return Handler.Ok({
    message: "Metas atualizadas com sucesso",
  });
};

module.exports.definicao = async (event, action) => {
  const { company } = action;
  const { perspectiva, categoria, companyId } = event.pathParameters;
  const [anos, estrategias_disponiveis, model] = await Promise.all([
    company.getExercises(),
    getEstrategiasDisponiveis(perspectiva, categoria),
    getModel.byCategory(categoria),
  ]);
  const metas = {};

  const promises = [];

  const run = async (ano) => {
    ano = parseInt(ano, 10);

    const { idParent, message, status } = await getModel.tableParent(
      companyId,
      ano - 1,
      Vendas
    );

    if (status === "success") {
      const filterCompany = {
        where: {
          EmpresaId: companyId,
          vendasId: idParent,
        },
        raw: true,
      };
      let statusResponse;
      let messageResponse;
      let objetivos;
      let estrategias_definidas;
      let quiz;
      let objetivo_id;

      const meta_receitas = await buscarMetaFinanceiro(company, ano - 1);
      if (meta_receitas) {
        await model
          .findOne(filterCompany)
          .then(async (result) => {
            if (result) {
              statusResponse = "success";
              messageResponse = "Dados anteriores encontrados.";
              objetivos = getObjectives(categoria, result);
              objetivo_id = objetivos.vendasId;
              if (categoria !== "relacionamento") {
                estrategias_definidas = await getEstrategiasCadastradas(
                  companyId,
                  result.vendasId,
                  perspectiva,
                  categoria
                );
              }
            } else {
              statusResponse = "goals_not_found";
              messageResponse =
                "Não foi localizado nenhum dado previamente preenchido.";
            }
            if (categoria === "relacionamento") {
              quiz = await getQuiz(
                companyId,
                objetivo_id,
                perspectiva,
                categoria,
                objetivos
              );
            }

            const outros_objetivos = await getOtherObjectives(
              perspectiva,
              categoria,
              filterCompany,
              meta_receitas,
              objetivos,
              ano
            );

            metas[ano] = {
              status: statusResponse,
              message: messageResponse,
              objetivo: objetivos,
              outros_objetivos,
              estrategias_definidas,
              meta_receitas,
              quiz,
            };
          })
          .catch((err) => {
            console.error("Erro ao buscar Definição:", err);
            metas[ano] = {
              status: "fatal_error",
              message: `Ocorreu um problema ao buscar a definição anterior.`,
            };
          });
      } else {
        metas[ano] = {
          status: "objectives_not_found",
          message: "Não foi localizar os objetivos Financeiros.",
        };
      }
    } else {
      metas[ano] = {
        status,
        message,
      };
    }
  };

  anos.map((ano) => promises.push(run(ano)));

  await Promise.all(promises);

  return Handler.Ok({
    metas,
    limite_estrategias: LimiteDeEstrategias(),
    estrategias_disponiveis,
  });
};
