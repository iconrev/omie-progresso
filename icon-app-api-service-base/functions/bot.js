const userController = require('../auth/userController');
const { apiToken } = require('../auth/telegramService');
const https = require('https');
const { getDashboard } = require('../services/admin/administrativo');


const response = (status, body = {}) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: status,
      ...body
    })
  };
}

const post = (options, data) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        try {
          responseBody = JSON.parse(responseBody);
        } catch (e) {
          console.error('ERRO', e)
          reject(e);
        }
        resolve(responseBody);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
    req.write(data)
    req.end();
  });
}

const sendMessage = async (chatId, from, message) => {

  const data = JSON.stringify({
    chat_id: `${chatId}`,
    text: message,
    parse_mode: 'html',
  }, null, 2)

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${apiToken}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  }

  try {
    const response = await post(options, data)
    if (!response.ok) {
      console.error('[ERRO]', response.description)
    } else {
      const nome = `${from.first_name} ${from.last_name}`
      console.info(`[INFO] Mensagem enviada com sucesso para [${nome}] [${from.id}]`)
    }


  } catch (e) {
    console.error(e)
  }

}

const sendMessageWait = async (chatId, from) => {
  return await sendMessage(chatId, from,
    'Só um minuto enquanto realizo sua solicitação :)'
  )
}

exports.main = async (event, context, callback) => {

  context.callbackWaitsForEmptyEventLoop = false;

  const body = JSON.parse(event.body);

  if (!body) {
    return response('fatal_error', {
      message: 'body_not_found'
    })
  }

  const { message } = body;

  if (!message) {
    return response('fatal_error', {
      message: 'message_not_found'
    })
  }

  const chatId = body.message.chat.id;
  const from = body.message.from;
  const text = body.message.text;

  const user = await userController.getUserBot(chatId)
  if (!user) {
    await sendMessage(chatId, from,
      'Você não tem permissão para esse chat :('
    )
    return response('unauthorized', {
      chatId: chatId,
      message: text
    })
  }

  if (text === '/statistics') {
    await sendMessageWait(chatId, from)
    const data = await getDashboard(event, context, callback, true)
    let responseRequest = ''

    if (data.status !== 'success') {
      responseRequest = 'Não foi possível buscar os dados :('
    } else {
      const { access_by_day } = data.dashboard;
      const { associados } = data.dashboard;
      const { requestsAssociate } = data.dashboard;
      const { companiesActivesTotal } = data.dashboard;
      const { usersActivesTotal } = data.dashboard;
      const { logsToday } = data.dashboard;

      let dateToday = new Date();
      dateToday.setTime(dateToday.getTime() - (3 * 60 * 60 * 1000));
      dateToday = dateToday.toISOString().slice(0, 10)

      const accessToday = (access_by_day[0].data === dateToday) ? access_by_day[0].acessos : 0

      responseRequest = 'Aqui estão os dados solicitados:\n\n'
      responseRequest += `<b>Associados:</b> ${associados}\n`
      responseRequest += `<b>Usuários ativos:</b> ${usersActivesTotal}\n`
      responseRequest += `<b>Empresas ativas:</b> ${companiesActivesTotal}\n`
      responseRequest += `<b>Acessos hoje:</b> ${accessToday}\n`
      responseRequest += `<b>Logs hoje:</b> ${logsToday.length}\n`

      if (requestsAssociate && requestsAssociate.length > 0) {
        responseRequest += `\n<b>ATENÇÃO</b>\n`
        const plural = (requestsAssociate.length > 1) ? 'ões' : 'ão'
        responseRequest += `Há ${requestsAssociate.length} solicitaç${plural} de upgrade de associados`
      }

    }
    await sendMessage(chatId, from, responseRequest)

  } else {
    await sendMessage(chatId, from,
      'Não entendi a sua solicitação :('
    )
  }

  return response('success', {
    chatId: chatId,
    message: text
  })

};

exports.crawl = async (event, context, callback) => {

  context.callbackWaitsForEmptyEventLoop = false;

  console.info('AAAA')

  return response('success', {
    message: 'oi'
  })

};