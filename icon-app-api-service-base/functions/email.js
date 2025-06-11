const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const Handler = require("../services/handler");
const Mail = require("../auth/mailService");
const { loadTemplate } = require("../services/generico/EmailTemplate");

const TEMPLATES = {
  new_document_associados: "NovoDocumentAssociados",
  new_task_responsible: "NovaTarefaUsuario",
};

async function getBodybySlug(slug, dataReplace) {
  const templateName = TEMPLATES[slug];

  if (!templateName) throw new Error(`Template [${templateName}] not found`);

  const body = await loadTemplate(templateName, dataReplace);
  return body;
}

exports.senderEmail = async (slug, to, subject, dataReplaceTemplate = {}) => {
  // const queueUrl = process.env.SQS_EMAIL_SERVICE_URL;
  const queueUrl = "https://sqs.sa-east-1.amazonaws.com/038249259268/sqs-queue-email-service-qa.fifo";

  if (!queueUrl) throw new Error("Queue not found");

  const messageBody = JSON.stringify({
    slug,
    to,
    subject,
    replace: dataReplaceTemplate,
  });

  const sqsParams = {
    QueueUrl: queueUrl,
    MessageBody: messageBody,
    MessageDeduplicationId: uuidv4(),
    MessageGroupId: "EmailQueueServiceSimbiose",
  };

  const sqs = new AWS.SQS({
    apiVersion: "2012-11-05",
    region: process.env.SQS_REGION,
  });

  try {
    await sqs.sendMessage(sqsParams).promise();
  } catch (error) {
    console.error(error);
  }

  return messageBody;
};

exports.sender = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!event.body) return Handler.Error({ message: "Body not found" });

  const body = JSON.parse(event.body);

  const item = await this.senderEmail(
    body.slug,
    body.to,
    body.subject,
    body.replace
  );

  return Handler.Ok({
    message: "E-mail enviado com sucesso",
    item,
  });
};

exports.main = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  console.info("event", event);

  const body = JSON.parse(event.Records[0].body);

  console.info("body", body);

  const promises = body.to.map(async (mail) => {
    try {
      const emailCompose = {
        to: mail,
        subject: body.subject,
        body: await getBodybySlug(body.slug, body.replace),
      };
      if (body.cc) {
        emailCompose.cc = body.cc;
      }
      if (body.bcc) {
        emailCompose.bcc = body.bcc;
      }
      const statusSendMail = await Mail.sendMail(emailCompose);
      console.info("statusSendMail", statusSendMail);
    } catch (error) {
      console.error(error);
    }
  });

  await Promise.all(promises);

  return Handler.Ok({
    message: "deu bom no sqs :)",
  });

};
