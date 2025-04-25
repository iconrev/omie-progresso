const models = require('../../../models');
const Handler = require('../../handler');
const AnoExercicioEmpresa = require('../../generico/AnoExercicioEmpresa');
const { Resumo_Interno, Diagnostico } = models;

const runYear = async (companyId, ano, avaliacao) => {
  const ano_base = parseInt(ano) - 1
  const filter = {
    where: {
      EmpresaId: companyId,
      ano_exercicio: ano_base
    },
    raw: true
  }
  const result = await Resumo_Interno.findOne(filter);
  if (result) {

    let valor = (result.financeiro + result.comercial + result.processos + result.pessoas) / 4;
    let percentual = (Math.floor(valor).toFixed()) / 100;

    let texto = ""
    if (percentual < 0.20) {
      texto = "* Péssimo desempenho nos fatores sob poder de ação da empresa."
    } else if (percentual >= 0.20 && percentual < 0.39) {
      texto = "* Fraco desempenho nos principais fatores sob poder de ação da empresa."
    } else if (percentual >= 0.40 && percentual < 0.59) {
      texto = "* Desempenho mediano nos fatores sob poder de ação da empresa."
    } else if (percentual >= 0.60 && percentual < 0.79) {
      texto = "* Bom desempenho nos principais fatores sob poder da empresa."
    } else if (percentual > 0.80) {
      texto = "* Ótimo desempenho nos fatores sob poder de ação da empresa."
    }

    await Diagnostico.findOne({ where: { EmpresaId: companyId }, raw: true })
      .then(async (result) => {
        if (result) {
          await Diagnostico.update({
            interno: valor
          }, { where: { EmpresaId: companyId } })
            .then(result => {
              console.info("Tabela de diagnóstico para Ambiente Interno atualizado com sucesso.");
            })
            .catch(err => console.error(err))
        } else {
          await Diagnostico.create({
            EmpresaId: companyId,
            interno: Math.floor(valor / 4)
          })
            .then(result => {
              console.info("Tabela de diagnóstico para Ambiente Interno criado com sucesso.");
            })
            .catch(err => console.error(err))
        }
      });

    avaliacao[ano] = {
      percentual: percentual,
      texto: texto
    }

  } else { // default
    avaliacao[ano] = {
      percentual: 0,
      texto: "* Péssimo desempenho nos fatores sob poder de ação da empresa."
    }
  }
}

module.exports.avaliacao = async (event, action) => {

  const { companyId } = action;

  const anos = await AnoExercicioEmpresa.getAll(companyId)
  const avaliacao = {}

  const promises = anos.map(ano => runYear(companyId, ano, avaliacao));
  await Promise.all(promises);

  return Handler.Ok({
    avaliacao: avaliacao
  })
  
};