const models = require("../../models");

const { Questionarios, Questionarios_Avaliacao } = models;
const { getEstrategiasCadastradas } = require("./FuncoesDeEstrategias");

module.exports.getQuizByCategoria = async (categoria) => {
  let quiz = [];

  const filter = {
    include: [
      {
        model: Questionarios_Avaliacao,
      },
    ],
    where: {
      categoria,
    },
    raw: true,
  };

  await Questionarios.findAll(filter)
    .then((questionarios) => {
      quiz = questionarios;
    })
    .catch((err) => {
      console.error("Erro ao buscar Quiz", err);
    });

  return quiz;
};

module.exports.getQuizByPerspectiva = async (perspectiva) => {
  let quiz = [];

  const filter = {
    include: [
      {
        model: Questionarios_Avaliacao,
      },
    ],
    where: {
      perspectiva,
    },
    raw: true,
  };

  await Questionarios.findAll(filter)
    .then((questionarios) => {
      quiz = questionarios;
    })
    .catch((err) => {
      console.error("Erro ao buscar Quiz", err);
    });

  return quiz;
};

module.exports.getQuiz = async (
  companyId,
  foreingKeyId,
  perspectiva,
  categoria,
  objetivos
) => {
  const quiz = [];
  let estrategias_definidas = [];

  if (foreingKeyId) {
    estrategias_definidas = await getEstrategiasCadastradas(
      companyId,
      foreingKeyId,
      perspectiva,
      categoria
    );
  }

  const filter = {
    include: [
      {
        model: Questionarios_Avaliacao,
      },
    ],
    where: {
      perspectiva,
      categoria,
    },
    raw: true,
  };

  await Questionarios.findAll(filter)
    .then((questionarios) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const questionarioData of questionarios) {
        const data = {
          id: questionarioData.id,
          questionario_avaliacao_id: questionarioData.questionario_avaliacao_id,
          descricao: questionarioData.descricao,
          pontuacao: questionarioData.pontuacao,
          field: questionarioData.field,
          avaliacao_opcao_label:
            questionarioData["Questionarios_Avaliacao.label"],
          avaliacao_opcao_value:
            questionarioData["Questionarios_Avaliacao.value"],
          definicao_meta: false,
          estrategia_escolhida_id: null,
          estrategia_escolhida_label: null,
        };

        let option = [];
        if (estrategias_definidas.length > 0) {
          option = estrategias_definidas.filter(
            (element) => element.field === questionarioData.field
          );
        }

        if (option.length === 1) {
          // eslint-disable-next-line prefer-destructuring
          option = option[0];
          data.definicao_meta = true;
          data.estrategia_escolhida_id = option.innerValue;
          data.estrategia_escolhida_label = option.label;
        } else {
          data.definicao_meta = false;
          data.estrategia_escolhida_id = null;
          data.estrategia_escolhida_label = null;
        }

        if (objetivos) {
          data.meta_avaliacao = objetivos[`meta_${questionarioData.field}`];
        } else {
          data.meta_avaliacao = null;
        }

        quiz.push(data);
      }
    })
    .catch((err) => {
      console.error("Erro ao buscar Quiz", err);
    });

  return quiz;
};

module.exports.getQuizByField = async (field) => {
  let quiz = [];

  const filter = {
    where: {
      field,
    },
    raw: true,
  };

  await Questionarios.findAll(filter)
    .then((questionarios) => {
      quiz = questionarios;
    })
    .catch((err) => {
      console.error("Erro ao buscar Quiz", err);
    });

  return quiz;
};

module.exports.calculaPontuacaoQuiz = (
  questionarios,
  resultados,
  prefix = "meta_",
  sufix = ""
) => {
  let response = 0;
  let total = 0;

  if (resultados) {
    // eslint-disable-next-line no-restricted-syntax
    for (const questionario of questionarios) {
      const fieldName = `${prefix}${questionario.field}${sufix}`;

      const avaliacaoUsuario = resultados[fieldName];

      // eslint-disable-next-line no-continue
      if (!avaliacaoUsuario) continue;

      const avaliacaoLabels =
        questionario["Questionarios_Avaliacao.value"].split("; ");
      const avaliacaoPontuacao = questionario.pontuacao.split("; ");

      total += parseFloat(avaliacaoPontuacao[0]);

      const index_label_avaliacao_usuario =
        avaliacaoLabels.indexOf(avaliacaoUsuario);
      const pontaucao_avaliacao_usuario =
        avaliacaoPontuacao[index_label_avaliacao_usuario];

      response += parseFloat(pontaucao_avaliacao_usuario);
    }

    response *= 100 / total;
  }

  return response || 0;
};
