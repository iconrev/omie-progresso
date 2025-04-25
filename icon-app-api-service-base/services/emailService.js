const axios = require("axios")
const utf8 = require("utf8")

module.exports.sendEmailAPI = async (subject = "", body = "", toAdress, serviceName) => {

    console.info("Sending the email with the API")

    if (typeof toAdress === "string") {
        toAdress = [toAdress]
    }

    if (!serviceName) {
        serviceName = process.env._HANDLER
    }

    const url = "https://q9mqehkp56.execute-api.sa-east-1.amazonaws.com/dev/api/email"

    const payload = {
        "application": serviceName,
        "subject": subject,
        "from_name": "Omie",
        "from_email": "noreply@omie.com.br",
        "to": toAdress,
        "content": btoa(utf8.encode(body)),
        // "reply_to": "dian+omiebankingv1@omie.com.br",
    }

    const headers = {
        "Content-Type": "application/json",
        "X-API-KEY": "ELCbDZwo817E8DUfH2kRz5SbfWqtpTkF2zN49ati",
    }

    try {
        const response = await axios.post(url, payload, {headers});
        console.log('Emails enviados!')
        return response.data
    } catch (e) {
        console.log(e)
        return { status: "error"}
    }
}
