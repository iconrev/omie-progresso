const { Op } = require("sequelize");

const models = require('../../../models');
const Macros = models.Macros;
const Handler = require('../../handler');
const AnoExercicioEmpresa = require('../../generico/AnoExercicioEmpresa');
const { UpdateSwot } = require('../../generico/UpdateFormulario');
const CarregarDados = require('../../generico/CarregarDados');
const Logger = require('../../../auth/logService');

const { fatores } = require("../../../core/models/analiseDataModels/Macros")

const {
  Macros_Swot_Opcoes_Oportunidades,
  Macros_Swot_Opcoes_Ameacas
} = models;


const get_macro_options_table_swot = async (
  empresaId,
  origem
) => {

  const modelTable = {
    oportunidade: Macros_Swot_Opcoes_Oportunidades,
    ameaca: Macros_Swot_Opcoes_Ameacas
  }
  const query = {
    where: {
      [Op.or]: [{ empresaId }, { empresaId: null }],
    },
    attributes: ["id", "descricao"],
    raw: true,
  };

  const options = await modelTable[origem].findAll(query);

  const optionsMap = options.map((i) => ({ id: i['id'] - 1, description: i['descricao'] }))
  optionsMap.sort((i1, i2) => i1.id - i2.id)
  return optionsMap;
};

module.exports.macros_tabela_swot = async (event, context, callback) => {
  const { companyId } = event.pathParameters;
  const swot_oportunidades_promise = get_macro_options_table_swot(
    companyId,
    "oportunidade"
  );
  const swot_ameacas_promise = get_macro_options_table_swot(
    companyId,
    "ameaca"
  );

  const fatoresMap = []
  fatores.forEach(function (value, i) {
    fatoresMap.push({ id: i, description: value })
  });

  const [
    swot_oportunidades,
    swot_ameacas
  ] = await Promise.all([
    swot_oportunidades_promise,
    swot_ameacas_promise
  ]);

  return Handler.Ok({
    oportunidades: swot_oportunidades,
    ameacas: swot_ameacas,
    fatores: fatoresMap,
  });
};

module.exports.diagnostic_external_macro_list = async (event, action) => {

  const { companyId } = action;

  const anos = await AnoExercicioEmpresa.getAll(companyId)
  const promisesSwot = anos.map(async (ano) => await CarregarDados.getAll(companyId, Macros, ano));
  const swots = await Promise.all(promisesSwot);

  const response = {}
  swots.forEach((swot, index) => response[anos[index]] = swot)

  await Logger.setSuccessLog(action, 'Carregando dados do Ambiente Externo - Macro Ambiente');

  return Handler.Ok({
    swot: response
  });

}

module.exports.diagnostic_external_macro_swot_update = async (event, action) => {
  return await UpdateSwot(event, Macros, 'macro', action);
};
