const axios = require("axios");
const AWS = require("aws-sdk");
const uuid = require("uuid");
const models = require("../../models");
const Handler = require("../handler");

const modelIntegration = models.Empresas_Integracao_Omie;
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: "sa-east-1" });

async function isKeysValid(appKey, appSecret) {
  console.log(1);
  const url = "https://app.omie.com.br/api/v1/crm/status/";

  try {
    const response = await axios.post(
      url,
      {
        app_key: appKey,
        app_secret: appSecret,
        call: "ListarStatus",
        param: [
          {
            pagina: 1,
            registros_por_pagina: 1,
          },
        ],
      },
      {
        headers: {
          "Content-type": "application/json",
        },
      }
    );

    console.log("status: %s", response.status);
    console.log("response: %s", response);

    if (response.status === 200) return true;
    return false;
  } catch (e) {
    console.error(e.response.data);
    return false;
  }
}

async function submitDREData(data) {
  console.log("Submitting DRE Data");
  const dreInfo = {
    TableName: process.env.TABLE_REPORTS_CALL,
    Item: data,
  };
  return dynamoDb
    .put(dreInfo)
    .promise()
    .then(() => {
      console.log("success");
    })
    .catch((err) => {
      console.log(err);
    });
}

const dreInfo = (company_id, app_key, app_secret, year) => {
  console.info("Starting dreInfo function");
  console.info("Company ID: %", company_id);
  console.info("App key: %", app_key);
  console.info("Year: %", year);

  const timestamp = new Date().getTime();
  console.info("timestamp: %", timestamp);
  return {
    req_id: uuid.v4(),
    company_id,
    app_key,
    app_secret,
    status: "working",
    year,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const runDREData = async (integration, years) => {
  console.info("Starting runDREData function");
  console.info("Model integration: %s", integration);
  console.info("Years:", years);

  for (const year of years) {
    console.log("Ano: %s", year);
    await submitDREData(
      dreInfo(
        integration.company_id,
        integration.app_key,
        integration.app_secret,
        year
      )
    );
  }
};

module.exports.postKeys = async (event, action) => {
  if (event.body === "")
    return Handler.BadRequest({ message: "Body not found!" });

  const body = JSON.parse(event.body);

  console.log("body: %s", body);

  const appKey = body.app_key;
  const appSecret = body.app_secret;

  const result = await isKeysValid(appKey, appSecret);

  console.log("result: %s", result);

  if (!result)
    return Handler.Fail({
      message: "Chaves de integração inválidas.",
    });

  const response = await modelIntegration.findAll({
    where: {
      company_id: action.companyId,
    },
  });

  const integration = {
    app_key: appKey,
    app_secret: appSecret,
    company_id: action.companyId,
  };

  if (response.length !== 0) {
    await modelIntegration.update(integration, {
      where: {
        company_id: action.companyId,
      },
    });
  } else {
    await modelIntegration.create(integration);
  }

  // aqui é sucesso
  // o que faço?
  const years = await action.company.getExercises();
  const lastYear = parseInt(years[years.length - 1], 10);

  console.info("last year", lastYear);

  for (let i = 1; i < 4; i++) {
    years.push(lastYear - i);
  }

  await runDREData(integration, years);

  return Handler.Ok({
    message: "Integração realizada com sucesso!",
  });
};

module.exports.getKeys = async (event, action) => {
  const response = await modelIntegration.findAll({
    where: {
      company_id: action.companyId,
    },
  });

  if (response.length !== 0) {
    const integration = await modelIntegration.findOne(
      {
        attributes: ["app_key", "app_secret"],
      },
      {
        where: {
          company_id: action.companyId,
        },
      }
    );

    const key = integration.app_key;
    const { app_secret } = integration;
    const secret =
      app_secret.slice(0, 4) + "*".repeat(18) + app_secret.slice(-4);

    const body = {
      app_key: key,
      app_secret: secret,
    };

    return Handler.Ok({
      message: body,
    });
  }
  return Handler.NotFound({
    message: "Chaves não encontradas.",
  });
};
