from mysql.connector import connect, Error
import json
import requests


class UpdateSwot:
    def __init__(self, env : str) -> None:    
        self.__env = env
        self.__connection = None
        self.__cursor = None

    @property
    def user_id(self):
        if self.__env != 'prod-local':
            return '18d1190a-5802-498a-b9cc-f5bbd92a6a5b'
        else:
            return 'e229bc5f-6f15-49e0-8487-1a0102c2c610'

    def __connect_db(self):

        file = open('/home/dgidaro/projects/omie-progresso/config/config.json', 'r')        
        config = json.load(file)[self.__env]

        try:
            self.__connection = connect(
                host=config.get('host'),
                port=config.get('port'),
                user=config.get('username'),
                password=config.get('password'),
                database=config.get('database'),
            )
            self.__cursor = self.__connection.cursor()
        except Error as e:
            print(e)

    def __load_companies(self):
        query = 'SELECT id, nome, cnpj FROM Empresas'
        self.__cursor.execute(query)
        return self.__cursor.fetchall()

    def __get_exercicios(self, companyId):
        query = f"SELECT ano FROM Empresa_Exercicios WHERE EmpresaId = '{companyId}'"
        self.__cursor.execute(query)
        return self.__cursor.fetchall()

    def __clean_base(self, companyId, year):

        query = f"DELETE FROM Swot_Oportunidades WHERE EmpresaId = '{companyId}' and ano_exercicio = '{year}'"
        self.__cursor.execute(query)

        query = f"DELETE FROM Swot_Ameacas WHERE EmpresaId = '{companyId}' and ano_exercicio = '{year}'"
        self.__cursor.execute(query)

        self.__connection.commit()

        print('[INFO] Base limpa com sucesso')

    def __get_swot(self, table, companyId, year):

        if table != 'Macros':
            table += '_Swot'

        fields = [
            "id",
            "oportunidadeId",
            "atratividade_da_oportunidade",
            "probabilidade_de_sucesso_da_oportunidade",
            "ameacaId",
            "relevancia_da_ameaca",
            "probabilidade_de_ocorrer_a_ameaca",
        ]
        if table == 'Macros':
            fields.append('fator')             
            fields.append('tendencia')             

        query = f"SELECT {', '.join(fields)} FROM {table} WHERE EmpresaId = '{companyId}' and ano_exercicio = '{year}'"
        self.__cursor.execute(query)
        swots = self.__cursor.fetchall()

        response = list()
        for swot in swots:   

            data_swot = {
                "id": swot[0],
                "oportunidadeId": swot[1],
                "atratividade_da_oportunidade": swot[2],
                "probabilidade_de_sucesso_da_oportunidade": swot[3],
                "ameacaId": swot[4],
                "relevancia_da_ameaca": swot[5],
                "probabilidade_de_ocorrer_a_ameaca": swot[6]
            }         

            if table == 'Macros':
                data_swot = {
                    **data_swot,
                    "fator": swot[7],                                        
                    "tendencia": swot[8], 
                }

            response.append(data_swot)

        return response

    def __post_swot(self, swot, ambiente, companyId, year):

        url = f'http://localhost:4459/{self.__env}/api/gestao/diagnostico/externo/{ambiente}/empresa/{companyId}/swot'
        headers = {
            'user_id': self.user_id
        }
        payload = {
            'ano': year,
            'swot': swot
        }
        try:
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code == 502:
                return self.__post_swot(swot, ambiente, companyId, year)
            print(f'[INFO][{ambiente}] ->', response.text)
        except Exception as e:
            print(e)

    def run(self):
        self.__connect_db()
        companies = self.__load_companies()[(980+480+445+516):]

        total = len(companies)
        
        for index, company in enumerate(companies, start=1):

            print(50*'=')            
            companyId, companyName, companyCnpj = company
            print('Empresa:', companyName, '-', companyCnpj, f'- {index}/{total}')
            print('Id:', companyId)

            years = self.__get_exercicios(companyId)

            for year in years:
                print(50*'-')            
                year = year[0]
                print('[INFO] Ano:', year)

                self.__clean_base(companyId, year)
                
                swot = self.__get_swot('Concorrentes', companyId, year)
                self.__post_swot(swot, 'concorrentes', companyId, year)
                swot = self.__get_swot('Clientes', companyId, year)
                self.__post_swot(swot, 'clientes', companyId, year)
                swot = self.__get_swot('Fornecedores', companyId, year)
                self.__post_swot(swot, 'fornecedores', companyId, year)
                swot = self.__get_swot('Macros', companyId, year)
                self.__post_swot(swot, 'macro', companyId, year)


if __name__ == "__main__":
    update = UpdateSwot('prod-local')
    update.run()