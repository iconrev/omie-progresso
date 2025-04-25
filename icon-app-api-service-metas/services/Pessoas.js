/* eslint-disable no-param-reassign */
const Handler = require("./handler");
const models = require("../models");

const { Pessoas } = models;
const {
  LimiteDeEstrategias,
  SalvarAtualizarEstrategias,
  getEstrategiasDisponiveis,
  getEstrategiasCadastradas,
} = require("./generico/FuncoesDeEstrategias");
const { ConvertStringToFloat } = require("./generico/ConvertStringToFloat");
const { buscarMetaFinanceiro } = require("./generico/BuscarMetaFinanceiro");
const { getDadosAnteriores } = require("./generico/DadosAnteriores");
const {
  SuggestionRule,
  SuggestionIncreaseValue,
} = require("./generico/SuggestionRule");
const { getQuiz } = require("./generico/FuncoesDeQuestionarios");
const getModel = require("./generico/GetModel");

const getObjectives = (result) => {
  console.info("Buscando objetivos e avaliações");

  delete result.createdAt;
  delete result.updatedAt;

  return result;
};

const getOtherObjectives = async (
  perspectiva,
  categoria,
  filterCompany,
  meta_receitas,
  objetivos_categoria,
  ano_exercicio
) => {
  let objetivos;
  const dadosAnteriores = await getDadosAnteriores(
    perspectiva,
    filterCompany.where.EmpresaId,
    ano_exercicio - 1
  );

  if (categoria === "engajamento") {
    const sugestao_absenteismo = SuggestionRule(
      dadosAnteriores.absenteismo,
      true
    );

    objetivos = {
      ...objetivos,
      sugestao_absenteismo,
    };
  }

  if (categoria === "retencao") {
    const sugestao_rotatividade = SuggestionRule(
      dadosAnteriores.rotatividade,
      true
    );

    objetivos = {
      ...objetivos,
      sugestao_rotatividade,
    };
  }

  if (categoria === "inovacao") {
    const sugestao_inovacao = SuggestionIncreaseValue(
      dadosAnteriores.total_inovacao_implementada_empresa
    );
    const sugestao_faturamento = SuggestionRule(
      dadosAnteriores.faturamento_oriundo_inovacao
    );

    objetivos = {
      ...objetivos,
      sugestao_inovacao,
      sugestao_faturamento,
    };
  }

  return objetivos;
};

const cleanFields = (categoria, objetivo, companyId) => {
  objetivo.EmpresaId = companyId;
  const { quiz } = objetivo;
  const quizClean = [];
  if (quiz) {
    for (const index in quiz) {
      const item = quiz[index];
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
    }
    delete objetivo.quiz;
  }

  if (categoria === "engajamento") {
    objetivo.absenteismo_meta = ConvertStringToFloat(objetivo.absenteismo_meta);
  }

  if (categoria === "inovacao") {
    objetivo.inovacao_meta = ConvertStringToFloat(objetivo.inovacao_meta);
    objetivo.inovacao_previsao = ConvertStringToFloat(
      objetivo.inovacao_previsao
    );
    objetivo.faturamento_gasto_inovacao_meta = ConvertStringToFloat(
      objetivo.faturamento_gasto_inovacao_meta
    );
    objetivo.faturamento_gasto_inovacao_previsao = ConvertStringToFloat(
      objetivo.faturamento_gasto_inovacao_previsao
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

  const body = JSON.parse(event.body);

  const { objetivo } = body;
  const id = objetivo.pessoasId;
  const queryEmpresa = {
    where: { EmpresaId: companyId, pessoasId: id },
    raw: true,
  };
  const { objetivoClean, quiz } = cleanFields(categoria, objetivo, companyId);

  const estrategias = body.estrategias === undefined ? quiz : body.estrategias;

  const result = await model.findOne(queryEmpresa);
  if (result) {
    await model.update(objetivoClean, {
      where: { id: result.id },
      raw: true,
    });
  } else {
    await model.create(objetivoClean);
  }

  await SalvarAtualizarEstrategias(
    perspectiva,
    categoria,
    estrategias,
    companyId,
    id
  );

  return Handler.Ok({
    message: "Metas atualizadas com sucesso",
  });
};

module.exports.definicao = async (event, action) => {
  const { company, companyId } = action;
  const { perspectiva, categoria } = event.pathParameters;
  const anos = await company.getExercises();
  const estrategias_disponiveis = await getEstrategiasDisponiveis(
    perspectiva,
    categoria
  );
  const model = await getModel.byCategory(categoria);
  const metas = {};

  const promises = [];

  const run = async (ano) => {
    ano = parseInt(ano, 10);

    const { idParent, message, status } = await getModel.tableParent(
      companyId,
      ano - 1,
      Pessoas
    );

    if (status === "success") {
      const filterCompany = {
        where: {
          EmpresaId: companyId,
          pessoasId: idParent,
        },
        raw: true,
      };
      let statusResponse;
      let messageResponse;
      let objetivos;
      let objetivo_id;
      let estrategias_definidas;
      let quiz;

      const meta_receitas = await buscarMetaFinanceiro(company, ano - 1);
      if (meta_receitas) {
        await model
          .findOne(filterCompany)
          .then(async (result) => {
            if (result) {
              statusResponse = "success";
              messageResponse = "Dados anteriores encontrados.";
              objetivos = getObjectives(result);
              objetivo_id = objetivos.pessoasId;
              if (categoria === "inovacao") {
                estrategias_definidas = await getEstrategiasCadastradas(
                  companyId,
                  objetivo_id,
                  perspectiva,
                  categoria
                );
              }
            } else {
              statusResponse = "goals_not_found";
              messageResponse =
                "Não foi localizado nenhum dado previamente preenchido.";
            }

            if (categoria !== "inovacao") {
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
