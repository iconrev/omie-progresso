const { Op } = require("sequelize");

const models = require("../../../models");

const { Clientes } = models;
const { Clientes_Swot } = models;
const Handler = require("../../handler");
const AnoExercicioEmpresa = require("../../generico/AnoExercicioEmpresa");
const {
  UpdateFormulario,
  UpdateSwot,
} = require("../../generico/UpdateFormulario");
const CarregarDados = require("../../generico/CarregarDados");
const { avaliarEmpresa } = require("./ClientesAvaliacao");
const UpdateDadosAmbienteExterno = require("../../generico/UpdateDadosAmbienteExterno");
const Logger = require("../../../auth/logService");

const {
  Clientes_Swot_Opcoes_Oportunidades,
  Clientes_Swot_Opcoes_Ameacas
} = models;


const get_clientes_options_table_swot = async (
  empresaId,
  origem
) => {

  const modelTable = {
    oportunidade: Clientes_Swot_Opcoes_Oportunidades,
    ameaca: Clientes_Swot_Opcoes_Ameacas
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


module.exports.clientes_tabela_swot = async (event, context, callback) => {
  const { companyId } = event.pathParameters;
  const swot_oportunidades_promise = get_clientes_options_table_swot(
    companyId,
    "oportunidade"
  );
  const swot_ameacas_promise = get_clientes_options_table_swot(
    companyId,
    "ameaca"
  );

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
  });
};

module.exports.diagnostic_external_customers_list = async (event, action) => {
  const { companyId } = action;

  const anos = await AnoExercicioEmpresa.getAll(companyId);
  const promisesSwot = anos.map((ano) =>
    CarregarDados.getAll(companyId, Clientes, ano)
  );
  const swots = await Promise.all(promisesSwot);

  const response = {};
  swots.forEach((swot, index) => (response[anos[index]] = swot));

  await Logger.setSuccessLog(
    action,
    "Carregando dados do Ambiente Externo - Clientes"
  );

  return Handler.Ok({
    data: response,
  });
};

module.exports.diagnostic_external_customers_update = async (event, action) => {
  const { companyId } = action;

  const { data, ano } = JSON.parse(event.body);

  if (ano === "" || ano === undefined || ano === null) {
    return Handler.BadRequest({
      message: "Deve-se informar o ano referente a avaliação",
    });
  }

  const anoInt = parseInt(ano);

  if (isNaN(anoInt) || anoInt < 2019) {
    return Handler.BadRequest({
      message: "Deve-se informar um ano válido",
    });
  }

  const promisesUpdates = [];

  for (let i = 0; i < data.length; i++) {
    const dataItem = data[i];
    dataItem.EmpresaId = companyId;
    dataItem.ano_exercicio = ano;
    promisesUpdates.push(UpdateFormulario(companyId, dataItem, Clientes));
  }

  await Promise.all(promisesUpdates);

  const dados = await CarregarDados.getAll(companyId, Clientes, ano);
  const avaliacao = await avaliarEmpresa(dados, companyId);
  if (avaliacao.status === "success") {
    await UpdateDadosAmbienteExterno.UpdateMedia(
      avaliacao,
      companyId,
      ano,
      "clientes"
    );
  }

  await Logger.setSuccessLog(
    action,
    "Diagnóstico Externo - Clientes atualizado com sucesso"
  );

  return Handler.Ok({
    message: "Clientes atualizado com sucesso",
  });
};

module.exports.diagnostic_external_customers_swot_update = async (
  event,
  action
) => UpdateSwot(event, Clientes_Swot, "clientes", action);

module.exports.diagnostic_external_customers_swot_list = async (
  event,
  action
) => {
  const { companyId } = action;

  const anos = await AnoExercicioEmpresa.getAll(companyId);
  const promisesSwot = anos.map((ano) =>
    CarregarDados.getAll(companyId, Clientes_Swot, ano)
  );
  const swots = await Promise.all(promisesSwot);

  const response = {};
  swots.forEach((swot, index) => (response[anos[index]] = swot));

  await Logger.setSuccessLog(
    action,
    "Carregando dados do Ambiente Externo - Clientes - SWOT"
  );

  return Handler.Ok({
    swot: response,
  });
};
