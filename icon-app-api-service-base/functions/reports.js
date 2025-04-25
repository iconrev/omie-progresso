const Reports = require("../services/reports/main");
const { middleware, ActionsClass } = require("../auth/authorizer");
const Handler = require("../services/handler");
const AWS = require("aws-sdk");

const os = require("os");

const chromium = require("@sparticuz/chromium-min")
const puppeteer = require("puppeteer-core")
const fs = require("fs").promises;


const { v4: uuidv4 } = require("uuid");

const { sendEmailAPI } = require("../services/emailService")

const {
  Swot_Avaliacao,
  Swot_Avaliacao_Client,
  Swot_Avaliacao_Fornecedor
} = require("../core/models/analise_data")

const { getAllQuestionarios, getSobrevivencia } = require("../services/diagnostico/sobrevivencia/questionario")
const SetupQuestionario = require('../services/data/Questionario');
const { generatePDF, readPDF, exportPDFToS3, HTMLEmailReport } = require("../services/reports/main")

const ACTIONS = {
  getReport: new ActionsClass(Reports.getReport, "report", {
    allowDemo: false,
  }),
};

const getReportAction = (event) => {
  if (event.httpMethod === "GET") {
    const { reportType } = event.pathParameters;
    if (reportType === "diagnostico") return ACTIONS.getReport;
    if (reportType === "estrategias") return Handler.NotFound();
    if (reportType === "diretrizes") return Handler.NotFound();
    return Handler.NotFound();
  }

  return null;
};

const swot_ambiente_externo = {
  concorrentes: Swot_Avaliacao,
  clientes: Swot_Avaliacao_Client,
  fornecedores: Swot_Avaliacao_Fornecedor,
}

exports.main = async (event, context, callback) => {
  const action = getReportAction(event);
  return middleware(event, context, callback, action);
};

const getReportData = async (companyId) => {
  try {

    const anoCorrente = (new Date().getFullYear()).toString()
    let questionarios = await getAllQuestionarios(companyId)
    let anos = Object.keys(questionarios)

    if (anos.indexOf(anoCorrente) === -1) {
      await SetupQuestionario.setup(companyId, anoCorrente)
      questionarios = await getAllQuestionarios(companyId)
    }

    console.log('Carregando dados de Sobrevivência')

    return questionarios

  } catch (error) {
    return Handler.Exception("Erro ao recuperar dados de Sobrevivência", error)
  }
};

exports.dispatcher = async (event, context, callback) => {
  console.info("==================");

  const records = event.Records;

  console.info("records", JSON.stringify(records));

  for (let i = 0; i < records.length; i++) {
    console.info("================================");
    const message = JSON.parse(records[i].Sns.Message);
    console.info("message", JSON.stringify(message));

    const response = await getReportData(message.company_id);

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

    item.survival = response

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

const interno_col_analise_template = {
  analiseFinanceiro: {
    title: 'Financeiro',
    lines: {
      1: {
        color: "success",
        title: "FATURAMENTO",
        sublines: {
          1: { name: "Receita Bruta", result_key: "receita_bruta", classification_key: "smile_receita_bruta", unity: "real" },
          2: { name: "% Crescimento da Receita", result_key: "crescimento", classification_key: "smile_crescimento", unity: "percent" },
        }
      },
      2: {
        title: "RENTABILIDADE",
        color: "info",
        sublines: {
          1: { name: "% Rentabilidade", result_key: "rentabilidade", classification_key: "smile_rentabilidade_ultimo", unity: "percent" },
          2: { name: "EBITDA", result_key: "ebitda", classification_key: "smile_ebitda_ultimo", unity: "real" },
        }
      },
      3: {
        title: "DESPESAS",
        color: "warning",
        sublines: {
          1: { name: "% Custos de Mercadorias Vendidas", result_key: "custo_dos_produtos_industrializados", classification_key: "smile_custo_mercadoria", unity: "percent" },
          2: { name: "% Despesas sobre o faturamento Bruto", result_key: "percentual_total_despesas", classification_key: "smile_percentual_total_despesas", unity: "real" },
        }
      },
      4: {
        color: "danger",
        title: "ENDIVIDAMENTO",
        sublines: {
          1: { name: "Anos para quitar a dívida com o Lucro Líquido", result_key: "taxa", classification_key: "smile_taxa_divida_lucro", unity: "unity" },
          2: { name: "% Inadimplência (base mensal)", result_key: "inadimplencia", classification_key: "smile_inadimplencia", unity: "percent" },
        }
      },
    },
  },
  analiseComercial: {
    title: 'Comercial',
    lines: {
      1: {
        color: "success",
        title: "MARKTING",
        sublines: {
          1: { name: "% Clientes Ativos", result_key: "percentual_clientes_ativos", classification_key: "smile_percentual_clientes_ativos", unity: "percent" },
          2: { name: "# Novos Clientes", result_key: "novos_clientes_no_ano", classification_key: "smile_novos_clientes_no_ano", unity: "unity" },
        }
      },
      2: {
        color: "info",
        title: "VENDAS",
        sublines: {
          1: { name: "% Conversão de Propostas", result_key: "taxa_conversao", classification_key: "smile_taxa_conversao", unity: "percent" },
          2: { name: "Ticket Médio", result_key: "ticket_medio", classification_key: "smile_ticket_medio", unity: "real" },
        }
      },
      3: {
        title: "RELACIONAMENTO",
        color: "warning",
        sublines: {
          1: { name: "% Clientes Fidelizados", result_key: "percentual_clientes_fidelizados", classification_key: "smile_clientes_fidelizados", unity: "percent" },
          2: { name: "% Nível de relacionamento com Cliente", result_key: "nivel_relacionamento_clientes", classification_key: "smile_nivel_relacionamento_clientes", unity: "percent" },
        }
      },
      4: {
        color: "danger",
        title: "SATISFAÇÃO",
        sublines: {
          1: { name: "# Clientes Perdidos", result_key: "clientes_perdidos", classification_key: "smile_clientes_perdidos", unity: "unity" },
          2: { name: "% Reclamações/NF emitida", result_key: "taxa_reclamacao_nf", classification_key: "smile_taxa_reclamacao_nf", unity: "percent" },
        }
      }
    }
  },
  analiseProcessos: {
    title: 'Processos',
    lines: {
      1: {
        color: "success",
        title: "PRODUTIVIDADE",
        sublines: {
          1: { name: "Receita Bruta / Custo de Pessoal", result_key: "faturamento_custo_folha", classification_key: "smile_faturamento_custo_folha", unity: "real" },
          2: { name: "Quantidade de Entregas por Funcionários", result_key: "quantidade_entregue_funcionarios", classification_key: "smile_quantidade_entregue_funcionarios", unity: "float" },
        }
      },
      2: {
        color: "info",
        title: "QUALIDADE",
        sublines: {
          1: { name: "% Refugo / Produzido", result_key: "refugo_retrabalho", classification_key: "smile_refugo_retrabalho", unity: "percent" },
          2: { name: "% Custo Garantia / Receita Bruta", result_key: "custos_garantia", classification_key: "smile_custos_garantia", unity: "percent" },
        }
      },
      3: {
        title: "EFICIÊNCIA",
        color: "warning",
        sublines: {
          1: { name: "% Utilização da Capacidade Produtiva", result_key: "percentual_capacidade_produtiva", classification_key: "smile_percentual_capacidade_produtiva", unity: "percent" },
          2: { name: "% Eficiência Operacional", result_key: "percentual_disponibilidade_equipamento", classification_key: "smile_percentual_disponibilidade_equipamento", unity: "percent" },
          3: { name: "% Entrega no Prazo", result_key: "entregas_no_prazo", classification_key: "smile_entregas_no_prazo", unity: "percent" },
        }
      },
      4: {
        color: "danger",
        title: "LOGÍSTICA",
        sublines: {
          1: { name: "Quantidade de Giro de Estoque", result_key: "quantidade_giro_estoque", classification_key: "smile_quantidade_giro_estoque", unity: "float" },
          2: { name: "Valor de Estoque (R$)", result_key: "valor_do_estoque", classification_key: "smile_valor_do_estoque", unity: "real" },
        }
      }
    }
  },
  analisePessoas: {
    title: 'Pessoas',
    lines: {
      1: {
        color: "success",
        title: "COMPETÊNCIA",
        sublines: {
          1: { name: "% Competências Atuais/Requeridas", result_key: "nivel_competencia", classification_key: "smile_nivel_competencia", unity: "percent" },
        },

      },
      2: {
        color: "info",
        title: "ENGAJAMENTO",
        sublines: {
          1: { name: "% Absenteísmo", result_key: "absenteismo", classification_key: "smile_absenteismo", unity: "percent" },
          2: { name: "% de Engajamento", result_key: "nivel_engajamento", classification_key: "smile_nivel_engajamento", unity: "percent" },
        }
      },
      3: {
        title: "RETENÇÃO",
        color: "warning",
        sublines: {
          1: { name: "% Rotatividade", result_key: "rotatividade", classification_key: "smile_rotatividade", unity: "percent" },
          2: { name: "% Funcionários com > 12 meses", result_key: "funcionarios_antigos", classification_key: "smile_funcionarios_antigos", unity: "percent" },
          3: { name: "% Nivel dos Processos de Retenção", result_key: "nivel_retencao", classification_key: "smile_nivel_retencao", unity: "percent" },
        }
      },
      4: {
        color: "danger",
        title: "INOVAÇÃO",
        sublines: {
          1: { name: "# Inovações no ano", result_key: "total_inovacao_implementada_empresa", classification_key: "smile_total_inovacao_implementada_empresa", unity: "float" },
          2: { name: "% Faturamento para Inovação", result_key: "faturamento_oriundo_inovacao", classification_key: "smile_faturamento_oriundo_inovacao", unity: "percent" },
        }
      }
    }
  }
}


calcularPontos = async (resource, items, swot) => {
  const POINT_MAX_ITEM = 20;


  const pontos = [];

  for (const key of items) {
    if (key[resource] === swot.find(x => x.id == 1).descricao) {
      pontos.push(10);
    } else if (key[resource] === swot.find(x => x.id == 0).descricao) {
      pontos.push(POINT_MAX_ITEM);
    } else if (key[resource] === swot.find(x => x.id == 2).descricao) {
      pontos.push(0);
    }
  }

  const sumItem = pontos.reduce((a, b) => a + b, 0);
  const media = (100 / POINT_MAX_ITEM) * (sumItem / pontos.length);

  return media;
};

calculaMediaDiagnosticoExterno = async (msg) => {

  const externo_diagnostico = ["concorrentes", "clientes", "fornecedores"]

  for (let ED of externo_diagnostico) {

    items = msg.externo[ED][msg.year]

    const swot = swot_ambiente_externo[ED]

    const [
      media_preco,
      media_entrega,
      media_qualidade,
      media_inovacao,
      media_portifolio
    ] = await Promise.all([
      calcularPontos("preco", items, swot),
      calcularPontos("entrega", items, swot),
      calcularPontos("qualidade", items, swot),
      calcularPontos("inovacao", items, swot),
      calcularPontos("portifolio", items, swot),
    ]);

    msg.externo[ED].media_competitividade = {}
    msg.externo[ED].media_competitividade[msg.year] = {}


    let pontos = 0;
    // calcula os pontos
    pontos += media_preco;
    pontos += media_entrega;
    pontos += media_qualidade;
    pontos += media_inovacao;
    pontos += media_portifolio;
    // calcula o fator de competitividade
    pontos = pontos / 5;

    msg.externo[ED].media_competitividade[msg.year].media_preco = media_preco.toFixed(2)
    msg.externo[ED].media_competitividade[msg.year].media_entrega = media_entrega.toFixed(2)
    msg.externo[ED].media_competitividade[msg.year].media_qualidade = media_qualidade.toFixed(2)
    msg.externo[ED].media_competitividade[msg.year].media_inovacao = media_inovacao.toFixed(2)
    msg.externo[ED].media_competitividade[msg.year].media_portifolio = media_portifolio.toFixed(2)

    msg.externo[ED].media_competitividade[msg.year].competitividade = pontos.toFixed(2)

  }
  return msg
}

genareteReportWkhtmltopdf = async (msg) => {
  msg = await calculaMediaDiagnosticoExterno(msg)

  msg.interno_col_analise = interno_col_analise_template
  console.info("message", JSON.stringify(msg));
  const response = await generatePDF(msg);

  console.info(`Status: ${response.status}`);
  if (response.status === "error")
    return Handler.Error({
      message: "Não foi possível gerar o pdf",
    });

  const pdf = await readPDF();

  console.info("pdf loaded", pdf);

  resp = await exportPDFToS3(pdf, msg.report_type);

  return resp.url
}

genareteReportPuppteer = async (msg) => {
  console.log("Iniciando a Puppeteer!")

  const { req_id } = msg

  console.log("msg", JSON.stringify(msg))

  let url = ''

  console.log(`${process.version} node version`)
  try {

    console.info("Launch Browser")
    const args = chromium.args
    // args.push("--use-gl=swiftshader")
    const browser = await puppeteer.launch(
      {
        headless: true,
        args: args,
        executablePath: await chromium.executablePath(
          "https://chrome-puppeter.s3.sa-east-1.amazonaws.com/lambda-chromium-v114.0.0-pack.tar"
          // "https://chrome-puppeter.s3.sa-east-1.amazonaws.com/chromium-v126.0.0-pack.tar"
          // "https://github.com/Sparticuz/chromium/releases/download/v126.0.0/chromium-v126.0.0-pack.tar"
        ),
      },
    );
    console.info("New Page")
    const page = await browser.newPage();

    console.info("Goto Page")

    // const [response] = await Promise.all([
    //   page.goto('https://www.google.com/')
    // ]);

    // const base64 = await page.screenshot({ encoding: "base64" })

    // // console.log("ScreenShot \n", base64)

    const { UI_HOST } = process.env
    const keyVerify = "Master-Of-Universe-021e7cf9-b126-49c8-96cd-a0f7c6c79959"
    const urlReport = `https://${UI_HOST}/#/reports?req_id=${req_id}&key_verify=${keyVerify}`
    console.log("Url Report ->", urlReport)
    await page.goto(urlReport);
    await page.setViewport({ width: 1080, height: 1024 });


    const fileName = `${uuidv4()}`;
    const tempFolder = `/${uuidv4()}`;
    const filePath = os.tmpdir() + tempFolder;

    await fs.mkdir(filePath);
    const pdf_path = `${filePath}/${fileName}.pdf`;


    await page.waitForTimeout(7000)
    await page.pdf({
      path: pdf_path, format: 'A4', preferCSSPageSize: true,
      printBackground: true,
    })

    const s3 = new AWS.S3({ region: "sa-east-1" });
    const { BUCKET_DIAG_REPORTS } = process.env;
    // let BUCKET_DIAG_REPORTS = 'relatorios-diagnostico-qa'

    const readPDF = await fs.readFile(pdf_path, "base64")

    const buffer = Buffer.from(readPDF, "base64");
    const { Key } = await s3
      .upload({
        Bucket: BUCKET_DIAG_REPORTS,
        Key: pdf_path,
        Body: buffer,
        ContentEncoding: "base64",
        ContentType: "application/pdf",
      })
      .promise();

    console.info("Upload feito com sucesso");
    url = await s3.getSignedUrlPromise("getObject", {
      Bucket: BUCKET_DIAG_REPORTS,
      Key,
      Expires: 60 * 60 * 24 * 365,
    });

    let browserPid = browser.process()?.pid
    if (browserPid) {
      process.kill(browserPid)
    }

    await browser.close();

  } catch (e) {
    console.log(e)
    console.error(e);
  }

  console.log("url", url)

  return url
}

exports.generateReport = async (event, context, callback) => {
  console.info("==================");

  // Teste local
  if (event.body) {
    event = JSON.parse(event.body)
  }

  const records = event.Records;

  console.info("records", JSON.stringify(records));

  for (let record of records) {
    console.info("================================");

    let msg = JSON.parse(record.Sns.Message);

    // url = await genareteReportWkhtmltopdf(msg)
    url = await genareteReportPuppteer(msg)

    msg.url_report = url

    const html = await HTMLEmailReport(msg)

    resposta = await sendEmailAPI(`Relatório Omie SGE - ${msg.report_type}`, html, msg.user_email);

  }

  return Handler.Ok({ message: "✅😎" });
}

function formatDate(date = new Date()) {
  const year = date.toLocaleString('default', { year: 'numeric' });
  const month = date.toLocaleString('default', {
    month: '2-digit',
  });
  const day = date.toLocaleString('default', { day: '2-digit' });

  return [day, month, year,].join('/');
}



exports.getReportData = async (event) => {

  if (
    !event.queryStringParameters
    || !event.queryStringParameters.req_id
    || !event.queryStringParameters.key_verify
  ) return Handler.BadRequest()

  const { req_id, key_verify } = event.queryStringParameters
  const keyVerify = "Master-Of-Universe-021e7cf9-b126-49c8-96cd-a0f7c6c79959"

  if (key_verify !== keyVerify) return Handler.BadRequest()

  const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: "sa-east-1" });

  const params = {
    TableName: process.env.TABLE_REPORTS_CALL,
    KeyConditionExpression: "req_id = :req_id",
    ExpressionAttributeValues: { ":req_id": req_id }
  };

  let dyna_data
  try {
    dyna_data = await dynamoDb.query(params).promise();
  } catch (e) {
    console.error(e)
    return Handler.Fail()
  }

  if (!dyna_data.Items.length) return Handler.NotFound()

  let item = dyna_data.Items[0]
  const year = item.year

  let survival_gauge = await getSobrevivencia(item.company_id)
  survival_gauge = survival_gauge[year]

  item = await calculaMediaDiagnosticoExterno(item)


  let Item = {
    "req_id": item.req_id,
    data: {
      user_name: item.user_name,
      user_email: item.user_email,
      company_name: item.company_name,
      company_cnpj: item.company_cnpj,
      date: formatDate(new Date()),
      year,

      "report_type": item.report_type,
      "survival": {
        "questions": item.survival[year],
        "gauge": survival_gauge
      },
      "externo": {
        "concorrentes": {
          "list": item.externo.concorrentes[year],
          "swot": item.externo.concorrentes.swot[year],
          "media_competitividade": item.externo.concorrentes.media_competitividade[year]
        },
        "clientes": {
          "list": item.externo.clientes[year],
          "swot": item.externo.clientes.swot[year],
          "media_competitividade": item.externo.clientes.media_competitividade[year]
        },
        "fornecedores": {
          "list": item.externo.fornecedores[year],
          "swot": item.externo.fornecedores.swot[year],
          "media_competitividade": item.externo.fornecedores.media_competitividade[year]
        },
        "macros": {
          "list": item.externo.macros[year],
          "macro_avaliacao": item.externo.macros.macro_avaliacao[year]
        }
      },
      "interno": {
        "analiseFinanceiro": {
          "analise": item.interno.analiseFinanceiro[year],
          "media_gauge": item.interno.analiseFinanceiro.media_gauge[year]
        },
        "analiseComercial": {
          "analise": item.interno.analiseComercial[year],
          "media_gauge": item.interno.analiseComercial.media_gauge[year]
        },
        "analiseProcessos": {
          "analise": item.interno.analiseProcessos[year],
          "media_gauge": item.interno.analiseProcessos.media_gauge[year]
        },
        "analisePessoas": {
          "analise": item.interno.analisePessoas[year],
          "media_gauge": item.interno.analisePessoas.media_gauge[year]
        },
      }
    }
  }

  console.log(JSON.stringify({ Item }))

  return Handler.Ok({ Item });
}