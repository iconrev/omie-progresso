const AWS = require("aws-sdk");
const axios = require("axios");
const Handler = require("../services/handler");


async function sleep(ms) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDates(year) {
  console.log("Starting getDates function");
  console.log("Year: %s", year);
  console.log("Starting get3LastYearsDate function");

  const dates = [];
  for (let month = 0; month < 12; month++) {
    dates.push(new Date(year, month, 1).toLocaleDateString("en-GB"));
    dates.push(new Date(year, month + 1, 0).toLocaleDateString("en-GB"));
  }

  return dates;
}

async function dataParser(data, year) {
  const resultData = {
    receita_servico: null,
    receita_produto: null,
    outras_receitas: null,
    imposto_sobre_receitas: null,
    devolucao_abatimentos: null,
    custo_dos_produtos_industrializados: null,
    depreciacao_amortizacao: null,
    receitas_financeiras: null,
    despesas_financeiras: null,
    imposto_de_renda: null,
    constribuicao_social: null,
    endividamento: null,
    inadimplencia: null,
    despesa_pessoal: null,
    outras_despesas: null,
  };

  for (let index = 0; index < data.length; index++) {
    const dreList = data[index].listaDRE;

    for (let dreIndex = 0; dreIndex < dreList.length; dreIndex++) {
      switch (dreList[dreIndex].dreConta) {
        case "01. Receita Bruta de Vendas":
          if (resultData.outras_receitas === null)
            resultData.outras_receitas = 0;

          resultData.outras_receitas += dreList[dreIndex].valor;
          break;
        case "02. Impostos":
          if (resultData.imposto_sobre_receitas === null)
            resultData.imposto_sobre_receitas = 0;

          resultData.imposto_sobre_receitas += dreList[dreIndex].valor;
          break;
        case "03. Deduções de Receita":
          if (resultData.devolucao_abatimentos === null)
            resultData.devolucao_abatimentos = 0;

          resultData.devolucao_abatimentos += dreList[dreIndex].valor;
          break;
        case "01. Outras Receitas":
          if (resultData.outras_receitas === null)
            resultData.outras_receitas = 0;

          resultData.outras_receitas += dreList[dreIndex].valor;
          break;
        case "03. Outras Deduções de Receita":
          if (resultData.devolucao_abatimentos === null)
            resultData.devolucao_abatimentos = 0;

          resultData.devolucao_abatimentos += dreList[dreIndex].valor;
          console.log(dreList[dreIndex].valor);
          break;
        case "01. Custo Médio (CMC) das Vendas":
          if (resultData.custo_dos_produtos_industrializados === null)
            resultData.custo_dos_produtos_industrializados = 0;

          resultData.custo_dos_produtos_industrializados +=
            dreList[dreIndex].valor;
          break;
        case "02. Custo dos Serviços Prestados":
          if (resultData.custo_dos_produtos_industrializados === null)
            resultData.custo_dos_produtos_industrializados = 0;

          resultData.custo_dos_produtos_industrializados +=
            dreList[dreIndex].valor;
          break;
        case "03. Outros Custos":
          if (resultData.custo_dos_produtos_industrializados === null)
            resultData.custo_dos_produtos_industrializados = 0;

          resultData.custo_dos_produtos_industrializados +=
            dreList[dreIndex].valor;
          break;
        case "01. Despesas Variáveis":
          if (resultData.outras_despesas === null)
            resultData.outras_despesas = 0;

          resultData.outras_despesas += dreList[dreIndex].valor;
          break;
        case "02. Recuperação de Despesas Variáveis": // VER COM LUÍS
          console.log(dreList[dreIndex].valor);
          break;
        case "01. Despesas com Pessoal":
          if (resultData.despesa_pessoal === null)
            resultData.despesa_pessoal = 0;

          resultData.despesa_pessoal += dreList[dreIndex].valor;
          break;
        case "02. Despesas Administrativas":
          if (resultData.outras_despesas === null)
            resultData.outras_despesas = 0;

          resultData.outras_despesas += dreList[dreIndex].valor;
          break;
        case "03. Despesas Financeiras":
          if (resultData.despesas_financeiras === null)
            resultData.despesas_financeiras = 0;

          resultData.despesas_financeiras += dreList[dreIndex].valor;
          console.log(dreList[dreIndex].valor);
          break;
        case "10. Recuperação de Despesas Fixas": // VER COM LUÍS
          console.log(dreList[dreIndex].valor);
          break;
        case "01. Ativos": // VER COM LUÍS
          console.log(dreList[dreIndex].valor);
          break;
        case "02. Serviços": // VER COM LUÍS E TARCISIO
          console.log(dreList[dreIndex].valor);
          break;
        case "05. Outros Tributos":
          if (resultData.imposto_sobre_receitas === null)
            resultData.imposto_sobre_receitas = 0;

          resultData.imposto_sobre_receitas += dreList[dreIndex].valor;
          break;
        case "04. Despesas de Vendas e Marketing":
          if (resultData.outras_despesas === null)
            resultData.outras_despesas = 0;

          resultData.outras_despesas += dreList[dreIndex].valor;
          break;
        case "02. Receitas Financeiras":
          if (resultData.receitas_financeiras === null)
            resultData.receitas_financeiras = 0;

          resultData.receitas_financeiras += dreList[dreIndex].valor;
          break;
        default:
          console.warn(dreList[dreIndex].dreConta);
          console.log(dreList[dreIndex].dreConta);
          break;
      }
    }
  }

  const result = {
    ...resultData,
    status: "success",
    year: year,
  };

  console.info("Result dataParser", result);
  return result;
}

async function getDREData(appKey, appSecret, year) {
  console.log("Starting getDREData function");
  console.log("Year: %s", year);
  const url = "https://app.omie.com.br/api/v1/financas/dre/";

  const dates = getDates(year);

  const result = [];

  let n = dates.length - 1;
  let ping = 0;
  while (n > 0) {
    console.log("------");
    try {
      const dPeriodoInicial = dates[n - 1];
      const dPeriodoFinal = dates[n];
      console.info("buscando periodo:", dPeriodoInicial, "a", dPeriodoFinal);

      const start = Date.now();

      const response = await axios.post(url, {
        app_key: appKey,
        app_secret: appSecret,
        call: "ListarDRE",
        param: [
          {
            dPeriodoInicial: dPeriodoInicial,
            dPeriodoFinal: dPeriodoFinal,
            cTipoData: "1",
          },
        ],
      });

      const end = Date.now();
      console.log(`Execution time: ${end - start} ms`);

      if (response.status === 200) {
        console.log("response: %s", response);
        result.push(response.data);
        n -= 2;
      }
    } catch (e) {
      console.log("Error: %s", e);
      const code = e.response.data.faultcode;
      console.log(code);
      if (code === "SOAP-ENV:Client-832") {
        console.log(
          "Não foi encontrado nenhuma informação para o período especificado"
        );
        ping = 0;
        n -= 2;
      } else if (code === "SOAP-ENV:Client-8020") {
        console.log("Ping %d", ping);
        await sleep(1 * 1000);
        ping += 1;
      } else {
        console.log(e);
        ping = 0;
        n -= 2;
      }
    }
  }

  console.info("================");
  console.info("result", JSON.stringify(result));
  console.info("================");

  return dataParser(result, year);
}

async function sendSNS(params, snsTopic) {
  try {
    params.TopicArn = snsTopic
    const publishTextPromise = await new AWS.SNS({ region: "sa-east-1" })
      .publish(params)
      .promise();
    console.log(
      `Message ${params.Message} sent to the topic ${params.TopicArn}`
    );
    console.log(`MessageID is ${publishTextPromise.MessageId}`);
  } catch (e) {
    console.error(e, e.stack);
  }
}

exports.main = async (event, context, callback) => {
  console.info("Starting stream.main function");

  console.info("event", JSON.stringify(event));

  const records = event.Records;

  console.info("records", JSON.stringify(records));

  try {
    for (let record of records) {
      console.info("================================");
      console.info("record", JSON.stringify(record));

      const eventName = record["eventName"];

      console.info("eventName", eventName);
      const infos = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);

      const unmarshallString = JSON.stringify(infos)
      console.info('unmarshall', unmarshallString)

      const params = {
        Message: unmarshallString
      };

      if (eventName === "INSERT") {

        await sendSNS(params, process.env.SNS_REPORTS_DIAGNOSTICO)

        console.log("INSERT - SNS Enviado com sucesso. SNS Topic ->", process.env.SNS_REPORTS_DIAGNOSTICO);

      } else if (eventName === "MODIFY") {

        let snsTopicToSend = process.env.SNS_REPORTS_GENERATOR

        switch (true) {
          case (!infos.externo):
            snsTopicToSend = process.env.SNS_REPORTS_DIAGNOSTICO_EXTERNO
            break

          case (!infos.interno):
            snsTopicToSend = process.env.SNS_REPORTS_DIAGNOSTICO_INTERNO
        }

        await sendSNS(params, snsTopicToSend)

        console.log("MODIFY - SNS Enviado com sucesso. SNS Topic ->", snsTopicToSend);
      } else {
        console.info("Else da lambda");
      }
    }
  } catch (error) {
    console.error('errrorrr')
    console.error(error);
  }

  return Handler.Ok();
};
