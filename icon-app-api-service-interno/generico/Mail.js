const EmailConfig = require('./EmailConfig');
const Mail = require('nodemailer');

module.exports.sendMail = async (to, subject, message) => {
    
    const mailOptions = {
        from: "icon@icon.app.com.br",
        to: to,
        subject: subject,
        html: message
    };
    
    const transporter = Mail.createTransport({
        host: EmailConfig.host,
        port: EmailConfig.port,
        secure: false,
        auth: {
            user: EmailConfig.user,
            pass: EmailConfig.password
        },
        tls: { rejectUnauthorized: false }
    });

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return error;
        }
        return "O email foi enviado com sucesso";
    });
}