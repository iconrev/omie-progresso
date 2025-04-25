const models = require('../../../models');
const Questionario = models.Questionario_Swot;
const SetupQuestionario = require('../../data/Questionario');
const Handler = require('../../handler');
const Logger = require('../../../auth/logService');

const updateQuestionarioResposta = async (companyId, id, resposta) => {

  let response = false

  const data = {
    resposta2: resposta,
  }
  const where = {
    where: {
      EmpresaId: companyId,
      id: id
    },
  }
  await Questionario.update(data, where)
    .then(result => {
      response = true
    })
    .catch((err) => {
      console.log(err);
    });

  return response
}

const getAllQuestionarios = async (companyId, year = null, groupByYear = false) => {
  let filter = {
    where: {
      EmpresaId: companyId
    }
  }
  if (year) {
    filter['where']['ano_exercicio'] = year
  }

  let questionarios;
  if (groupByYear) {
    filter['attributes'] = ['ano_exercicio']
    filter['group'] = ['ano_exercicio']
    questionarios = []
  } else {
    questionarios = {}
  }

  await Questionario.findAll(filter)
    .then((response) => {
      if (response) {
        for (let i = 0; i < response.length; i++) {
          let item = response[i]
          let ano = item['ano_exercicio']

          if (groupByYear) {
            questionarios.push(ano)
          } else {
            if (!questionarios.hasOwnProperty(ano)) {
              questionarios[ano] = []
            }
            questionarios[ano].push({
              id: item.id,
              descricao: item.descricao,
              resposta: item.resposta2,
              peso: item.peso,
            })
          }


        }
      }
    })
  return questionarios
}

module.exports.getSobrevivencia = async (companyId) => {
  const avaliacao = {}

  const years = await getAllQuestionarios(companyId, null, true)
  for (const year of years) {
    let items = await getAllQuestionarios(companyId, year, false)
    items = items[year]

    try {
      let total = 0.0;

      for (const item of items) {
        let value = 0;
        if (item.resposta) {
          // para esta questão é uma EXCESSÃO, é a única que o "Não" é bom....
          // "9. Você percebe em sua empresa, conflitos de Egos que afetem o bom desempenho?"
          if (item.descricao.includes('conflitos de Egos que afetem o bom')) {

            if (item.resposta.includes("Sim")) {   // sim
              value = parseFloat(item.peso) * (0.8) / 100;
            } else if (item.resposta.includes("+/-")) { // mais ou menos
              value = parseFloat(item.peso) * (2.5) / 100;
            } else if (item.resposta.includes("Não")) { // não
              value = parseFloat(item.peso) * (4.3) / 100;
            }

          } else { // outras questões...

            if (item.resposta.includes("Sim")) {   // sim
              value = parseFloat(item.peso) * (4.3) / 100;
            } else if (item.resposta.includes("+/-")) { // mais ou menos
              value = parseFloat(item.peso) * (2.5) / 100;
            } else if (item.resposta.includes("Não")) { // não
              value = parseFloat(item.peso) * (0.8) / 100;
            }

          }
          total += value;
        }
      }

      total = Number((100 * (total / 5)).toFixed());
      total = total / 100;
      let texto = ""
      if (total < 0.19) {
        texto = "* Muito baixa probabilidade de sobrevivência nos próximos anos."
      } else if (total >= 0.20 && total <= 0.39) {
        texto = "* Baixa probabilidade de sobrevivência nos próximos anos."
      } else if (total >= 0.40 && total <= 0.59) {
        texto = "* Média probabilidade de sobrevivência nos próximos anos."
      } else if (total >= 0.60 && total <= 0.79) {
        texto = "* Boa probabilidade de sobrevivência nos próximos anos."
      } else if (total >= 0.80) {
        texto = "* Alta probabilidade de sobrevivência nos próximos anos."
      } else {
        texto = 'ERRO'
      }

      avaliacao[year] = {
        percentual: total,
        texto: texto
      }

    } catch (e) {
      console.error(e);
    }
  }

  return avaliacao

}

module.exports.diagnostico_questionario_avaliacao = async (event, action) => {

  const { companyId } = event.pathParameters;

  try {

    const avaliacao = await this.getSobrevivencia(companyId);

    return Handler.Ok({
      status: 'success',
      avaliacao: avaliacao
    });

  } catch (error) {
    return Handler.Exception(action, error)
  }
};

module.exports.diagnostic_survival_list = async (event, action) => {

  const { companyId } = event.pathParameters;

  try {

    const anoCorrente = (new Date().getFullYear()).toString()
    let questionarios = await getAllQuestionarios(companyId)
    let anos = Object.keys(questionarios)

    if (anos.indexOf(anoCorrente) === -1) {
      await SetupQuestionario.setup(companyId, anoCorrente)
      questionarios = await getAllQuestionarios(companyId)
    }

    await Logger.setSuccessLog(action, 'Carregando dados de Sobrevivência')

    return Handler.Ok({
      status: 'success',
      questionarios: questionarios
    });

  } catch (error) {
    return Handler.Exception(action, error)
  }

};

module.exports.diagnostic_survival_update = async (event, action) => {

  const { companyId } = event.pathParameters;

  try {

    const { avaliacao, ano } = JSON.parse(event.body);

    if (ano === "" || ano === undefined || ano === null) {
      return Handler.Error({
        message: 'Deve-se informar o ano referente a avaliação'
      })
    }

    if (parseInt(ano) < 2019) {
      return Handler.Error({
        message: 'Deve-se informar um ano válido'
      })
    }

    let errors = [];

    for (const item of avaliacao) {
      let itemId = item.id
      let resposta = item.resposta
      const status = await updateQuestionarioResposta(companyId, itemId, resposta)
      if (!status) {
        errors.push(item)
      }
    }

    let statusLog = 'success'
    let log = 'Atualização de questionário realizada com sucesso'
    let response = {}

    if (errors.length > 0) {
      statusLog = 'warning'
      log = 'Um ou mais itens não foram salvos'

      response = {
        items_errors: errors,
      }
    }

    response = {
      ...response,
      status: statusLog,
      message: log,
    }

    await Logger.setLog(action, statusLog, log);

    return Handler.Ok(response);

  } catch (error) {
    return Handler.Exception(action, error)
  }

};

module.exports.getAllQuestionarios = getAllQuestionarios