import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


HOST = ""
EMAIL =""
PORT = ""
PASSWORD = ""
FROM_ADDRESS = ""


class MailService:
    def __init__(
        self,
        mail_host: str = HOST,
        mail_user: str = EMAIL,
        mail_pass: str = PASSWORD,
        port: int = PORT,
        logger_service: any = None,
    ) -> None:
        self.__mail_user = mail_user
        self.__mail_pass = mail_pass
        self.__smtp = smtplib.SMTP(host=mail_host, port=port)
        self.__logger_service = logger_service
        self.__logged = False

    def __log_info(self, message: str) -> None:
        if self.__logger_service is None:
            print(message)
        else:
            self.__logger_service.log_info(message)

    def __log_error(self, message: str) -> None:
        if self.__logger_service is None:
            print(message)
        else:
            self.__logger_service.log_error(message)

    def __login(self) -> bool:
        try:
            self.__log_info("Connecting to the email server")
            self.__smtp.ehlo()
            self.__smtp.starttls()
            self.__smtp.ehlo()
            self.__smtp.login(user=self.__mail_user, password=self.__mail_pass)
            self.__log_info("Successfully connected")
            self.__logged = True
        except Exception as error:
            self.__log_error(error)
            return False

    def quit(self) -> None:
        self.__log_info("Logout the email server")
        self.__smtp.close()
        self.__smtp.quit()
        self.__logged = False
        self.__log_info("Successfully logout")

    def send_mail(
        self,
        subject: str,
        body: str,
        to_address: str,
        from_address: str = FROM_ADDRESS,
        is_html=False,
    ) -> bool:
        try:

            if is_html:
                mail_msg = MIMEMultipart("alternative")
            else:
                mail_msg = MIMEText(body)

            mail_msg["Subject"] = subject
            mail_msg["From"] = from_address
            mail_msg["To"] = to_address

            if is_html:
                part2 = MIMEText(body, "html")
                mail_msg.attach(part2)

            if not self.__logged:
                self.__login()

            self.__smtp.sendmail(
                mail_msg["From"], 
                mail_msg["To"], 
                mail_msg.as_string()
            )
            self.__log_info("Email successfully sent")

            self.quit()
            return True

        except Exception as error:
            self.__log_error(error)
            return False
