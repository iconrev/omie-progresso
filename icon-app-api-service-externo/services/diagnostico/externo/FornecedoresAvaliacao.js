const models = require('../../../models');
const { Fornecedores } = models;
const Handler = require('../../handler');
const AnoExercicioEmpresa = require('../../generico/AnoExercicioEmpresa');
const CarregarDados = require('../../generico/CarregarDados');
const UpdateDadosAmbienteExterno = require('../../generico/UpdateDadosAmbienteExterno');

const POINT_MAX = 20;

const calcula_competitividade = (valor) => {
  const pontuacao = {
    0: POINT_MAX, // sou melhor
    1: 10, // sou igual
    2: 0, // sou inferior
    3: null, // não avaliado
  }
  return pontuacao[valor]
}

const _avaliar = async = async (ambiente) => {
  const competitividade = {
    preco: [],
    qualidade: [],
    entrega: [],
    inovacao: [],
    portifolio: [],
  };
  let competitividade_media = 0;
  let status;

  try {

    for (const item of ambiente) {

      const preco = calcula_competitividade(item.preco)
      if (preco !== null) competitividade.preco.push(preco)

      const qualidade = calcula_competitividade(item.qualidade)
      if (qualidade !== null) competitividade.qualidade.push(qualidade)

      const entrega = calcula_competitividade(item.entrega)
      if (entrega !== null) competitividade.entrega.push(entrega)

      const inovacao = calcula_competitividade(item.inovacao)
      if (inovacao !== null) competitividade.inovacao.push(inovacao)

      const portifolio = calcula_competitividade(item.portifolio)
      if (portifolio !== null) competitividade.portifolio.push(portifolio)

    }

    for (const key in competitividade) {
      const sumItem = competitividade[key].reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      competitividade[key] = (sumItem > 0)
        ? (100 / POINT_MAX) * (sumItem / competitividade[key].length)
        : 0;
      competitividade_media += competitividade[key];
    }

    competitividade_media = (competitividade_media > 0)
      ? competitividade_media / Object.keys(competitividade).length
      : 0;

    status = 'success'

  } catch (e) {
    status = 'fatal_error'
    console.error('Erro ao avaliar empresa:', e)
  }

  return {
    status: status,
    competitividade: competitividade,
    concorrencia: competitividade_media,
  };
}

module.exports.fornecedores_avaliacao = async (event, action) => {

  const { companyId } = event.pathParameters;

  try {

    const anos = await AnoExercicioEmpresa.getAll(companyId)
    const avaliacao = {}

    for (const ano of anos) {
      let fornecedoresYear = await CarregarDados.getAll(companyId, Fornecedores, ano)
      let avaliacaoYear = await _avaliar(fornecedoresYear)
      if (avaliacaoYear['status'] === 'success') {
        await UpdateDadosAmbienteExterno.UpdateMedia(avaliacaoYear, companyId, ano, 'fornecedores')
      }
      avaliacao[ano] = {
        competitividade: avaliacaoYear.competitividade,
        concorrencia: avaliacaoYear.concorrencia,
      }
    }

    return Handler.Ok({
      avaliacao: avaliacao
    });

  } catch (error) {
    return Handler.Exception(action, error)
  }
};

exports.avaliarEmpresa = async (data) => {
  return _avaliar(data)
}