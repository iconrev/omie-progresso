const Mail = require("nodemailer");

const env = process.env.NODE_ENV || "dev";

const EmailConfig = {
  host: "email-smtp.us-east-1.amazonaws.com",
  port: 587,
  user: "AKIAQRZ6VMECPPPVJKET",
  password: "BEfZSnSOO60efwyd6P5yiLBm/FSeYKQheOHLm9ubwhWO",
};

module.exports.sendMail = async (compose) => {
  let response = null;

  try {
    let mailOptions = {
      from: "Omie Simbiose <simbiose@omie.com.br>",
      to: compose.to,
      subject: compose.subject,
      html: compose.body,
    };
    if (compose.cc) {
      mailOptions.cc = compose.cc;
    }
    if (compose.bcc) {
      mailOptions.bcc = compose.bcc;
    }

    if (env !== "prod") {
      mailOptions = {
        from: "Omie Simbiose <simbiose@omie.com.br>",
        to: "dian@omie.com.br",
        subject: `${compose.subject} - TESTE - DSV`,
        html: compose.body,
      };
    }

    const transporter = Mail.createTransport({
      host: EmailConfig.host,
      port: EmailConfig.port,
      secure: false,
      auth: {
        user: EmailConfig.user,
        pass: EmailConfig.password,
      },
      tls: true,
      logger: true,
      debug: true, // include SMTP traffic in the logs
    });
    const statusInfo = await transporter.sendMail(mailOptions);

    if (statusInfo.rejected.length === 0) {
      response = statusInfo;
    }
  } catch (e) {
    console.error(e);
  }

  return response;
};
