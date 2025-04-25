class TemplateService {

  constructor(companyId, ano_exercicio) {
    this.companyId = companyId;
    this.ano_exercicio = ano_exercicio;
  }

  async updateData(data) {
    data['EmpresaId'] = this.companyId;
    data['ano_exercicio'] = this.ano_exercicio;
    return data;
  }

  async createTemplate(model, data) {
    for (let i=0; i < data.length; i++) {
      const dataItem = data[i]
      await this.updateData(dataItem);

      await model.create(dataItem)
        .then(result => {
          console.info(`DataItem ${dataItem} adicionado com sucesso.`,);
        })
        .catch(err => {
          console.error(`Erro adicionando DataItem: ${item}.`);
          console.error(err);
        });
    }
  }
}

exports.TemplateService = TemplateService;