const { Op } = require("sequelize");

const Handler = require("../../handler");
const {
  UpdateFormulario,
  UpdateSwot,
} = require("../../generico/UpdateFormulario");
const CarregarDados = require("../../generico/CarregarDados");
const { avaliarEmpresa } = require("./ConcorrentesAvaliacao");
const UpdateDadosAmbienteExterno = require("../../generico/UpdateDadosAmbienteExterno");
const Logger = require("../../../auth/logService");
const models = require("../../../models");

const { Fornecedores } = models;
const { Fornecedores_Swot } = models;

const {
  Fornecedores_Swot_Opcoes_Oportunidades,
  Fornecedores_Swot_Opcoes_Ameacas
} = models;


const get_fornecedores_options_table_swot = async (
  empresaId,
  origem
) => {

  const modelTable = {
    oportunidade: Fornecedores_Swot_Opcoes_Oportunidades,
    ameaca: Fornecedores_Swot_Opcoes_Ameacas
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
module.exports.fornecedores_tabela_swot = async (event, context, callback) => {
  const { companyId } = event.pathParameters;
  const swot_oportunidades_promise = get_fornecedores_options_table_swot(
    companyId,
    "oportunidade"
  );
  const swot_ameacas_promise = get_fornecedores_options_table_swot(
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

module.exports.diagnostic_external_providers_list = async (event, action) => {
  const { companyId, company } = action;

  const anos = await company.getExercises();
  const response = {};

  const promisesSwot = anos.map(async (ano) =>{
    const swot = await CarregarDados.getAll(companyId, Fornecedores, ano);
    response[ano] = swot;
  });
  await Promise.all(promisesSwot);

  await Logger.setSuccessLog(
    action,
    "Carregando dados do Ambiente Externo - Fornecedores"
  );

  return Handler.Ok({
    data: response,
  });
};

module.exports.diagnostic_external_providers_update = async (event, action) => {
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
    promisesUpdates.push(UpdateFormulario(companyId, dataItem, Fornecedores));
  }

  await Promise.all(promisesUpdates);

  const dados = await CarregarDados.getAll(companyId, Fornecedores, ano);
  const avaliacao = await avaliarEmpresa(dados);
  if (avaliacao.status === "success") {
    await UpdateDadosAmbienteExterno.UpdateMedia(
      avaliacao,
      companyId,
      ano,
      "fornecedores"
    );
  }

  await Logger.setSuccessLog(
    action,
    "Diagnóstico Externo - Fornecedores atualizado com sucesso"
  );

  return Handler.Ok({
    message: "Fornecedores atualizado com sucesso",
  });
};

module.exports.diagnostic_external_providers_swot_update = async (
  event,
  action
) => UpdateSwot(event, Fornecedores_Swot, "fornecedores", action);

module.exports.diagnostic_external_providers_swot_list = async (
  event,
  action
) => {
  const { companyId, company } = action;
  const anos = await company.getExercises();
  const response = {};

  const promisesSwot = anos.map(async (ano) => {
    const swot = await CarregarDados.getAll(companyId, Fornecedores_Swot, ano);
    response[ano] = swot;
  });
  await Promise.all(promisesSwot);

  await Logger.setSuccessLog(
    action,
    "Carregando dados do Ambiente Externo - Fornecedores - SWOT"
  );

  return Handler.Ok({
    swot: response,
  });
};
