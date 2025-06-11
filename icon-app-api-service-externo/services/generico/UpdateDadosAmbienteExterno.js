const models = require('../../models');
const { DiagnosticoExternoAvaliacao } = models;

exports.UpdateMedia = async (data, companyId, ano, perspectiva) => {
  let filter = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: ano,
    }
  }
  await DiagnosticoExternoAvaliacao.findOne(filter)
    .then(async (result) => {
      if (!result) {
        const payload = {
          EmpresaId: companyId,
          [perspectiva]: data.concorrencia,
          ano_exercicio: ano,
        }
        await DiagnosticoExternoAvaliacao.create(payload)
          .then((result) => {
            console.log(`Média [${perspectiva}] adicionado com sucesso para o ano [${ano}].`);
          })
          .catch((err) => {
            console.log(`Error adicionar a média [${perspectiva}] para o ano [${ano}]`, err)
          });
      } else {
        const payload = {
          [perspectiva]: data.concorrencia
        }
        const where = {
          where: {
            EmpresaId: companyId,
            id: result.id
          },
        }
        await DiagnosticoExternoAvaliacao.update(payload, where)
          .then((result) => {
            console.log(`A média [${perspectiva}] foi atualizada com sucesso para o ano [${ano}]`);
          })
          .catch((err) => {
            console.log(`Error atualizando a média [${perspectiva}] para o ano [${ano}]`, err)
          });
      }
    })
    .catch((err) => {
      console.log(`ERRO UpdateMedia para o ano [${ano}]`, err)
    });
}