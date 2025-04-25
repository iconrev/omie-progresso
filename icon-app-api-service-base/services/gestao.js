const models = require('../models');
const { Diagnostico, DiagnosticoExternoAvaliacao, Resumo_Interno } = models;
const Handler = require('./handler');
const Questionario = require('../services/diagnostico/sobrevivencia/questionario');
const AnoExercicioEmpresa = require('./generico/AnoExercicioEmpresa');

const getAmbienteExterno = async (companyId) => {
  let anos = await AnoExercicioEmpresa.getAll(companyId)
  let avaliacao = {}

  for (let ano of anos) {
    ano = ano['ano']
    let filter = {
      where: {
        EmpresaId: companyId,
        ano_exercicio: ano
      }
    }
    await DiagnosticoExternoAvaliacao.findAll(filter)
      .then(async (result) => {
        if (result.length > 0) {
          let concorrentes = parseFloat(result[0].concorrentes) || 0
          let clientes = parseFloat(result[0].clientes) || 0
          let fornecedores = parseFloat(result[0].fornecedores) || 0
          let macro = parseFloat(result[0].macro) || 0
          let media = ((concorrentes + clientes + fornecedores + macro) / 4) / 100

          let texto = ""
          if (media < 0.19) {
            texto = "* Altíssima vulnerabilidade por fatores externos ao negócio."
          } else if (media >= 0.19 && media < 0.40) {
            texto = "* Alta vulnerabilidade por fatores externos ao negócio."
          } else if (media >= 0.40 && media < 0.60) {
            texto = "* Vulnerabilidade média por fatores externos ao negócio."
          } else if (media >= 0.60 && media < 0.80) {
            texto = "* Baixa vulnerabilidade por fatores externos ao negócio."
          } else {
            texto = "* Baixissima vulnerabilidade por fatores externos ao negócio."
          }

          avaliacao[ano] = {
            percentual: media,
            texto: texto
          }
        } else {
          avaliacao[ano] = {
            percentual: 0,
            texto: "* Altíssima vulnerabilidade por fatores externos ao negócio."
          }
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar diagnostico', error)
      })
  }

  return avaliacao

}

const getAmbienteInterno = async (companyId) => {
  let anos = await AnoExercicioEmpresa.getAll(companyId)

  let avaliacao = {}

  for (let ano of anos) {
    ano = ano['ano']
    let ano_base = parseInt(ano) - 1
    let filter = {
      where: {
        EmpresaId: companyId,
        ano_exercicio: ano_base
      }
    }
    await Resumo_Interno.findOne(filter)
      .then(async (result) => {
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
                    console.info("Tabela de diagnóstico para Ambiente Interno atualizada com sucesso para o ano [" + ano + "].");
                  })
                  .catch(err => console.error(err))
              } else {
                await Diagnostico.create({
                  EmpresaId: companyId,
                  interno: Math.floor(valor / 4)
                })
                  .then(result => {
                    console.info("Tabela de diagnóstico para Ambiente Interno criado com sucesso para o ano [" + ano + "].");
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
            percentual: 0.00,
            texto: "* Péssimo desempenho nos fatores sob poder de ação da empresa."
          }
        }
      })
      .catch(err => {
        console.error(err);
      });
  }

  return avaliacao
}

module.exports.grafico_diagnostico = async (event, action) => {

  const { companyId } = action;

  try {

    const sobrevivenciaPromise = Questionario.getSobrevivencia(companyId);
    const ambiente_externoPromise = getAmbienteExterno(companyId);
    const ambiente_internoPromise = getAmbienteInterno(companyId);

    const result = await Promise.all([sobrevivenciaPromise, ambiente_externoPromise, ambiente_internoPromise]);
    const [sobrevivencia, ambiente_externo, ambiente_interno] = result;

    return Handler.Ok({
      status: 'success',
      sobrevivencia: sobrevivencia,
      ambiente_externo: ambiente_externo,
      ambiente_interno: ambiente_interno,
    })

  } catch (error) {
    return Handler.Exception(action, error)
  }
}
