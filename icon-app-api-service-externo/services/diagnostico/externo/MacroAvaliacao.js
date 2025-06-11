const models = require('../../../models');
const { Macros } = models;
const Handler = require('../../handler');
const AnoExercicioEmpresa = require('../../generico/AnoExercicioEmpresa');
const CarregarDados = require('../../generico/CarregarDados');
const UpdateDadosAmbienteExterno = require('../../generico/UpdateDadosAmbienteExterno');

const { fatores } = require("../../../core/models/analiseDataModels/Macros")

const POINT_MAX = 3;

const calcula_competitividade = (valor) => {
  valor = parseInt(valor)
  if (valor === 0) { // alta
    return POINT_MAX;
  } else if (valor === 1) { // media
    return 2;
  } else if (valor === 2) {
    return 1; // baixa
  } else {
    return 0; // outros casos tipo "-"
  }
}

const _avaliar = async (macro) => {

  let fatoresYear = []
  let total = 0
  for (const item of macro) {
    try {

      let op = calcula_competitividade(item.atratividade_da_oportunidade) + calcula_competitividade(item.probabilidade_de_sucesso_da_oportunidade);
      let am = calcula_competitividade(item.relevancia_da_ameaca) + calcula_competitividade(item.probabilidade_de_ocorrer_a_ameaca);

      let media = 0
      if ((op + am) !== 0) {
        media = ((op - am + 4) / 8) * 100
      }

      total += media
      fatoresYear.push({
        fator: fatores[item['fator']] || 'Não definido',
        media: media
      });
    } catch (e) {
      console.error('Erro ao avaliar empresa:', e)
    }
  }

  total = total / macro.length

  return {
    status: 'success',
    fatores: fatoresYear,
    concorrencia: total,
  };

}

module.exports.macro_avaliacao = async (event, action) => {

  const { companyId } = event.pathParameters;

  try {

    let anos = await AnoExercicioEmpresa.getAll(companyId)

    let avaliacao = {}

    for (const ano of anos) {
      let macroYear = await CarregarDados.getAll(companyId, Macros, ano)
      let avaliacaoYear = await _avaliar(macroYear)
      if (avaliacaoYear['status'] === 'success') {
        await UpdateDadosAmbienteExterno.UpdateMedia(avaliacaoYear, companyId, ano, 'macro')
      }
      avaliacao[ano] = avaliacaoYear
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