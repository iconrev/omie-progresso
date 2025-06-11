const { Op } = require("sequelize");

const AWS = require("aws-sdk");
const Handler = require("../services/handler");

const CarregarDados = require("../services/generico/CarregarDados");
const models = require("../models");
const { avaliarEmpresa } = require("../services/diagnostico/externo/MacroAvaliacao")

const { Swot_Intensidade } = require("../core/models/analise_data")
const { fatores } = require("../core/models/analiseDataModels/Macros")

const {
  Concorrentes,
  Concorrentes_Swot,
  Clientes,
  Clientes_Swot,
  Fornecedores,
  Fornecedores_Swot,
  Macros,
  Concorrentes_Swot_Opcoes_Oportunidades,
  Concorrentes_Swot_Opcoes_Ameacas,
  Clientes_Swot_Opcoes_Oportunidades,
  Clientes_Swot_Opcoes_Ameacas,
  Fornecedores_Swot_Opcoes_Oportunidades,
  Fornecedores_Swot_Opcoes_Ameacas,
  Macros_Swot_Opcoes_Oportunidades,
  Macros_Swot_Opcoes_Ameacas,
} = models;

const get_options_table_swot = async (
  empresaId,
  origem
) => {

  const modelTable = {
    Concorrentes_Swot: {
      oportunidade: Concorrentes_Swot_Opcoes_Oportunidades,
      ameaca: Concorrentes_Swot_Opcoes_Ameacas
    },
    Clientes_Swot: {
      oportunidade: Clientes_Swot_Opcoes_Oportunidades,
      ameaca: Clientes_Swot_Opcoes_Ameacas
    },
    Fornecedores_Swot: {
      oportunidade: Fornecedores_Swot_Opcoes_Oportunidades,
      ameaca: Fornecedores_Swot_Opcoes_Ameacas
    },
    Macros: {
      oportunidade: Macros_Swot_Opcoes_Oportunidades,
      ameaca: Macros_Swot_Opcoes_Ameacas
    }
  }
  const query = {
    where: {
      [Op.or]: [{ empresaId }, { empresaId: null }],
    },
    attributes: ["id", "descricao"],
    raw: true,
  };

  const optionsOportunidadePromise = modelTable[origem]["oportunidade"].findAll(query);
  const optionsAmeacaPromise = modelTable[origem]["ameaca"].findAll(query);

  const [swot_oportunidades, swot_ameacas] = await Promise.all([optionsOportunidadePromise, optionsAmeacaPromise]);

  const optionsMap = { // Calculo necessário devido a V1 do swot ter sido feito com Index Array ao invés do Id de banco de dados
    optionsOportunidade: swot_oportunidades.map((i) => ({ id: i['id'] - 1, description: i['descricao'] })),
    optionsAmeaca: swot_ameacas.map((i) => ({ id: i['id'] - 1, description: i['descricao'] }))
  }

  return optionsMap;
};

const swotDataConverterOportunidadeAmeaca = async (companyId, swot, modelName, ano) => {

  const options = await get_options_table_swot(companyId, modelName)

  const swot_items = {}

  swot_items[ano] = swot.map((s) => {
    s.oportunidadeId = options.optionsOportunidade.find(x => x.id === parseInt(s.oportunidadeId))?.description ?? "-"
    s.atratividade_da_oportunidade = Swot_Intensidade[s.atratividade_da_oportunidade] ?? "-"
    s.probabilidade_de_sucesso_da_oportunidade = Swot_Intensidade[s.probabilidade_de_sucesso_da_oportunidade] ?? "-"

    s.ameacaId = options.optionsAmeaca.find(x => x.id === parseInt(s.ameacaId))?.description ?? "-"
    s.relevancia_da_ameaca = Swot_Intensidade[s.relevancia_da_ameaca] ?? "-"
    s.probabilidade_de_ocorrer_a_ameaca = Swot_Intensidade[s.probabilidade_de_ocorrer_a_ameaca] ?? "-"

    if (modelName === "Macros") {
      s.fator = fatores[s.fator] ?? "-"
      s.tendencia = Swot_Intensidade[s.tendencia] ?? "-"
    }
    return s
  })

  return swot_items
}


const getSwot = async (companyId, model, ano, rawData) => {


  const swots = await CarregarDados.getAll(companyId, model, ano, rawData);

  // eslint-disable-next-line no-return-assign
  console.info(`Carregando dados do Ambiente Externo - ${model.tableName}`);

  if (!rawData) {
    const response = {};
    response[ano] = swots.map((s) => s.toJSON());
    return response
  }

  const swotOportunidadeAmeaca = await swotDataConverterOportunidadeAmeaca(companyId, swots, model.tableName, ano)

  return swotOportunidadeAmeaca
}

const macro_avaliacao = async (companyId, ano) => {

  let avaliacao = {}
  let macroYear = await CarregarDados.getAll(companyId, Macros, ano)
  let avaliacaoYear = await avaliarEmpresa(macroYear)
  avaliacao[ano] = avaliacaoYear

  return avaliacao

};

const getReportData = async (companyId, ano) => {
  const concorrentes_promise = getSwot(companyId, Concorrentes, ano, false)
  const concorrentes_swot_promise = getSwot(companyId, Concorrentes_Swot, ano, true)

  const clientes_promise = getSwot(companyId, Clientes, ano, false)
  const clientes_swot_promise = getSwot(companyId, Clientes_Swot, ano, true)

  const fornecedores_promise = getSwot(companyId, Fornecedores, ano, false)
  const fornecedores_swot_promise = getSwot(companyId, Fornecedores_Swot, ano, true)

  const macros_promise = getSwot(companyId, Macros, ano, true)
  const macros_macro_avaliacao_promise = macro_avaliacao(companyId, ano)


  const [
    concorrentes,
    concorrentes_swot,
    clientes,
    clientes_swot,
    fornecedores,
    fornecedores_swot,
    macros,
    macros_macro_avaliacao,

  ] = await Promise.all([
    concorrentes_promise,
    concorrentes_swot_promise,
    clientes_promise,
    clientes_swot_promise,
    fornecedores_promise,
    fornecedores_swot_promise,
    macros_promise,
    macros_macro_avaliacao_promise,
]);

  concorrentes.swot = concorrentes_swot
  clientes.swot = clientes_swot
  fornecedores.swot = fornecedores_swot
  macros.macro_avaliacao = macros_macro_avaliacao

  return { concorrentes, clientes, fornecedores, macros };
};

exports.dispatcher = async (event, context, callback) => {
  console.info("==================");

  // Teste local
  if (event.body) {
    event = JSON.parse(event.body)
  }

  const records = event.Records;

  console.info("records", JSON.stringify(records));

  for (let i = 0; i < records.length; i++) {
    console.info("================================");
    const message = JSON.parse(records[i].Sns.Message);
    console.info("message", JSON.stringify(message));

    const response = await getReportData(message.company_id, message.year);

    const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: "sa-east-1" });

    const params = {
      TableName: process.env.TABLE_REPORTS_CALL,
      Key: {
        "company_id": message.company_id,
        "req_id": message.req_id
      }
    };

    const dyna_data = await dynamoDb.get(params).promise();

    const item = dyna_data.Item

    console.info(`Item recuperado do Dynamo -> ${JSON.stringify(item)}`);

    item.externo = response

    const reportData = {
      TableName: process.env.TABLE_REPORTS_CALL,
      Item: item,
    };

    try {
      await dynamoDb.put(reportData).promise();
      console.info(`Gravado no DynamoDB com sucesso data ${JSON.stringify(reportData)}`);
    } catch (e) {
      console.error("Dynamo Erro ", e);
    }
  }

  return Handler.Ok();

};
