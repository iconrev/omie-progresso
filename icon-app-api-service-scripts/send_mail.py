import os
from mail_service import MailService


class SendMail:
    def __init__(self) -> None:
        self.service = MailService()

    def __get_path_project(self) -> str:
        path = os.path.dirname(os.path.abspath(__file__))
        path = path.replace('/spiders/utils', '')
        return path

    def send_template(self, template_name : str, subject : str, to_address : str) -> bool:
        
        template_file = f'{self.__get_path_project()}/templates/{template_name}.html'
        template_text = open(template_file, 'r').read()

        self.service.send_mail(subject, template_text, to_address, is_html=True)        
