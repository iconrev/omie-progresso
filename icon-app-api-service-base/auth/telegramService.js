
const https = require('https');
const env = process.env.NODE_ENV || 'dev';

const apiToken = '1825708984:AAEqt0lslr0MGgoRCYYg7lnz4Wq28DG4E0M';

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

module.exports.SendMessageAdm = async (text) => {

    if (env !== 'prod') return

    const chatId = 1018636294

    const data = JSON.stringify({
        chat_id: `${chatId}`,
        text: text,
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
            // const nome = `${from.first_name} ${from.last_name}`
            // console.info(`[INFO] Mensagem enviada com sucesso para [${nome}] [${from.id}]`)
        }

    } catch (e) {
        console.error(e)
    }

}

exports.apiToken = apiToken;