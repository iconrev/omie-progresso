const models = require('../../models');
const Empresa_Exercicios = models.Empresa_Exercicios;

/**
 * Recupera os anos de exerícios disponível para a empresa
 */
exports.getAll = async (companyId) => {

  const years = []

  const filter = {
    where: {
      EmpresaId: companyId
    },
    order: [
      ['ano', 'DESC'],
  ],
  }
  await Empresa_Exercicios.findAll(filter)
    .then(response => {
      response.forEach(item => years.push(item.ano))
    })

  return years
}