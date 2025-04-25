const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const crypto = require("crypto");
const path = require("path");
const ejs = require("ejs");
const aws = require("aws-sdk");
const fs = require("fs").promises;
const { F_OK } = require("fs").constants;
const os = require("os");
const wkhtmltopdf = require("wkhtmltopdf");
const axios = require("axios")
const Handler = require("../handler");
const survivalDiagnostic = require("../diagnostico/sobrevivencia/questionario");
const externalDiagnostic = require("../diagnostico/externo/AvaliacaoAmbienteExterno");
const internalDiagnostic = require("../diagnostico/interno/Avaliacao_amb_int");

const pathWkhtmltopdf = path.join(__dirname, "..", "..", "/bin", "wkhtmltopdf");
console.info("pathWkhtmltopdf", pathWkhtmltopdf);
wkhtmltopdf.command = pathWkhtmltopdf;

const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: "sa-east-1" });

// const cognitoRegion = "us-east-1";

// const cssPath = path.join(__dirname, "/stylesheet", "style.css");

const fileName = `${uuidv4()}`;
const tempFolder = `/${uuidv4()}`;
const filePath = os.tmpdir() + tempFolder;

async function getData(event, action) {
  const { reportType } = event.pathParameters;
  if (reportType === "survival") {
    console.info(`AWS config: ${JSON.stringify(AWS.config)}`);
    const response = await survivalDiagnostic.diagnostic_survival_list(
      event,
      action
    );
    return JSON.parse(response.body).questionarios;
  }
  if (reportType === "external") {
    return JSON.stringify(
      externalDiagnostic.diagnostico(event, action, undefined).body
    );
  }
  if (reportType === "internal")
    return JSON.stringify(
      internalDiagnostic.diagnostico(event, action, undefined).body
    );
  return {};
}

async function checkFileExists(file) {
  return fs
    .access(file, F_OK)
    .then(() => true)
    .catch(() => false);
}

async function generatePDF(event) {
  const reportType = event.report_type;
  const year = event.year;
  console.log(`Path: ${path.join(__dirname, "/templates", "/template.ejs")}`);
  const template = await fs.readFile(
    path.join(__dirname, "/templates", "/template.ejs"),
    "utf-8"
  );
  const templatePath = path.join(__dirname, "/templates", `${reportType}.ejs`);

  let data = event
  console.log(`Data: ${JSON.stringify(data)}`);

  if (data === undefined) return null;

  const url = "https://api.simbiose-preview.omie.com.br/service-base/puppeteerGraphs"

  for (let a of ["analiseFinanceiro", "analiseComercial", "analisePessoas", "analiseProcessos"]) {

    let percentagem = data.interno[a].media_gauge[year].percentual
    const response = await axios.get(url, { params: { percentagem: percentagem } })

    data.interno[a].media_gauge[year].html = response.data.html
  }

  const html = ejs.render(template, {
    templatePath,
    data,
    year,
    // cssPath: cssPath,
  });

  console.info("html");
  console.info(html);

  // await fs.writeFile('localFiles/eita.html', html, function (err) {
  //   if (err) throw err;
  //   console.log('Saved!');
  // });
  // const output = 'localFiles/eita.pdf'

  let exists = await checkFileExists(filePath);
  if (!exists) await fs.mkdir(filePath);
  const output = `${filePath}/${fileName}.pdf`;
  const stream = wkhtmltopdf(html, { pageSize: "A4", debug: true });

  await fs.writeFile(output, stream);

  exists = await checkFileExists(output);
  if (!exists) return { status: "error" };
  console.info(`Arquivo ${output} criado com sucesso`);
  return { status: "success" };
}

async function exportPDFToS3(pdf, reportType) {
  console.info("Export PDF to S3 function");
  const s3 = new aws.S3({ region: "sa-east-1" });
  const { BUCKET_DIAG_REPORTS } = process.env;

  const buffer = Buffer.from(pdf, "base64");
  const { Key } = await s3
    .upload({
      Bucket: BUCKET_DIAG_REPORTS,
      Key: `report_${reportType}_${fileName}.pdf`,
      Body: buffer,
      ContentEncoding: "base64",
      ContentType: "application/pdf",
    })
    .promise();

  console.info("Upload feito com sucesso");
  try {
    const url = await s3.getSignedUrlPromise("getObject", {
      Bucket: BUCKET_DIAG_REPORTS,
      Key,
      Expires: 60,
    });
    return {
      message: "Documento disponível",
      url,
    };
  } catch (err) {
    return {
      message: `S3 error: ${err}`,
    };
  }
}

async function readPDF() {
  console.debug("Lendo PDF");
  const input = `${filePath}/${fileName}.pdf`;
  console.info(`Input: ${input}`);

  return fs.readFile(input, "base64");
}

module.exports.getReport = async (event, action) => {
  const reqId = `${uuidv4()}`;

  console.info(reqId);

  const { companyId, reportType, year } = event.pathParameters;

  console.info(companyId, reportType, year);

  const now = new Date();
  const created_at = parseInt(Math.floor(now.getTime()/1000.0));
  now.setFullYear(now.getFullYear() + 1);
  const expires_at = parseInt(Math.floor(now.getTime()/1000.0));

  const companyData = await action.company.getCompanyData();

  const payLoad = {
    req_id: reqId,
    company_id: companyId,
    company_name: companyData.nome,
    company_cnpj: companyData.cnpj,
    year,
    user_name: action._user.nome,
    user_email: action._user.email,
    report_type: reportType,
    created_at: created_at,
    expires_at: expires_at,
  };

  const reportData = {
    TableName: process.env.TABLE_REPORTS_CALL,
    Item: payLoad,
  };
  try {
    await dynamoDb
      .put(reportData)
      .promise()
      console.info(`Gravado no DynamoDB com sucesso ReqId ${reqId}, data ${payLoad}`)
  } catch (e) {
    console.error('Dynamo Erro ', e)
  }

  return Handler.Ok({
    req_id: reqId
  });

};


async function HTMLEmailReport(data) {

  console.log(`Path: ${path.join(__dirname, "/templates", "/templateEmail.ejs")}`);
  const template = await fs.readFile(
    path.join(__dirname, "/templates", "/templateEmail.ejs"),
    "utf-8"
  );
  const templatePath = path.join(__dirname, "/templates", `emailRelatorio.ejs`);

  // let data = event
  console.log(`Data: ${JSON.stringify(data)}`);

  if (data === undefined) return null;

  const html = ejs.render(template, {
    templatePath,
    data,
    // cssPath: cssPath,
  });

  // console.info("html");
  // console.info(html);

  // await fs.writeFile('localFiles/eita.html', html, function (err) {
  //   if (err) throw err;
  //   console.log('Saved!');
  // });
  // const output = 'localFiles/eita.pdf'

  return html;
}

module.exports.readPDF = readPDF
module.exports.generatePDF = generatePDF
module.exports.exportPDFToS3 = exportPDFToS3
module.exports.HTMLEmailReport = HTMLEmailReport
