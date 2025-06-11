'use strict';
const models = require('../../../models');
const Handler = require('../../handler');
const Filtro = require('../../generico/FiltrarAnoEmpresa');
const {
  Dre,
  Objetivo_Receitas,
  Objetivo_Rentabilidade,
  Objetivo_Endividamento,
  Analise_Objetivo_Receitas,
  Analise_Objetivo_Rentabilidade,
  Analise_Objetivo_Endividamento,
  Questionario_Swot
} = models;

module.exports.diagnostico = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const { companyId } = event.pathParameters;

  let total_preenchimento = 0;
  let total_smile_points = 0;
  let ano_exercicio = 0;

  // obtem o último ano exercício para análise
  await Filtro.ultimo_ano_exercicio(Dre, companyId)
    .then(ano => {
      ano_exercicio = ano;
    });

  // verifica objetivos de receitas
  // Espera-se um range de -3/3 smiles points
  await Dre.findOne({ where: { EmpresaId: companyId, ano_exercicio: ano_exercicio } }).then(async dre => {
    if (dre) {
      // objetivo receitas
      await Objetivo_Receitas.findOne({ where: { dreId: dre.id } })
        .then(async objetivo => {
          await Analise_Objetivo_Receitas.findOne({
            where: { objetivoReceitaId: objetivo.id },
          })
            .then(analise_objetivo => {
              total_preenchimento += 1;
              total_smile_points += calcula_smile_points(
                analise_objetivo.smile_receita_bruta,
              );
              total_smile_points += calcula_smile_points(
                analise_objetivo.smile_crescimento_quatro,
              );
              total_smile_points += calcula_smile_points(
                analise_objetivo.smile_crescimento,
              );
            })
            .catch(analise_objetivo_err => {
              console.log(analise_objetivo_err);
              return Handler.Error({
                message:
                  'Erro obtendo dados de Analise do Objetivo de Receitas',
              });
            });
        })
        .catch(objetivo_receita_err => {
          console.log(objetivo_receita_err);
          return Handler.Error({
            message: 'Erro obtendo dados do Objetivo',
          });
        });
      // objetivo rentabilidade
      await Objetivo_Rentabilidade.findOne({ where: { dreId: dre.id } })
        .then(async objetivo => {
          if (objetivo) {
            await Analise_Objetivo_Rentabilidade.findOne({
              where: { objetivoRentabilidadeId: objetivo.id },
            })
              .then(analise_objetivo => {
                total_preenchimento += 1;
                total_smile_points += calcula_smile_points(
                  analise_objetivo.smile_lucro_liquido,
                );
                total_smile_points += calcula_smile_points(
                  analise_objetivo.smile_rentabilidade_media,
                );
                total_smile_points += calcula_smile_points(
                  analise_objetivo.smile_rentabilidade_ultimo,
                );
                total_smile_points += calcula_smile_points(
                  analise_objetivo.smile_ebitda_medio,
                );
                total_smile_points += calcula_smile_points(
                  analise_objetivo.smile_ebitda_ultimo,
                );
              })
              .catch(analise_objetivo_err => {
                console.log(analise_objetivo_err);
                return Handler.Error({
                  message: 'Erro obtendo dados de Analise da Rentabilidade',
                });
              });
          }
        })
        .catch(objetivo_receita_err => {
          console.log(objetivo_receita_err);
          return Handler.Error({
            message: 'Erro obtendo dados de Rentabilidade',
          });
        });
      // objetivo endividamento
      await Objetivo_Endividamento.findOne({ where: { dreId: dre.id } })
        .then(async objetivo => {
          if (objetivo) {
            await Analise_Objetivo_Endividamento.findOne({
              where: { objetivoEndividamentoId: objetivo.id },
            })
              .then(analise_objetivo => {
                total_preenchimento += 1;
                total_smile_points += calcula_smile_points(
                  analise_objetivo.smile_divida,
                );
                total_smile_points += calcula_smile_points(
                  analise_objetivo.smile_taxa_divida_lucro,
                );
                total_smile_points += calcula_smile_points(
                  analise_objetivo.smile_inadimplencia,
                );
              })
              .catch(analise_objetivo_err => {
                console.log(analise_objetivo_err);
                return Handler.Error({
                  message: 'Erro obtendo dados de Analise Endividamento',
                });
              });
          }
        })
        .catch(objetivo_receita_err => {
          console.log(objetivo_receita_err);
          return Handler.Error({
            message: 'Erro obtendo dados de Endividamento',
          });
        });
    }
  });

  let porcentagem_financeiro = 1;
  porcentagem_financeiro += 9 * total_preenchimento;
  if (total_smile_points > 0) {
    porcentagem_financeiro += 6 * total_smile_points;
  }

  // retorna os pontos calculados...
  return Handler.Ok({
    percentual: porcentagem_financeiro,
    ano: ano_exercicio
  });
};

const calcula_smile_points = smile => {
  if (smile == 'Ruim') return -1;
  else if (smile == 'Bom') return 1;
  else return 0;
};

/**
 * Gráfico do Geral do Ambiente Interno
 */
exports.grafico = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const { companyId } = event.pathParameters;

  let total_preenchimento = 0;
  let total_smile_points = 0;
  let ano_exercicio = 0;

  // obtem o último ano exercício para análise
  await Filtro.ultimo_ano_exercicio(Dre, companyId).then(ano => {
    ano_exercicio = ano;
  });

  let dre = null;
  try {
    await Dre.findOne({ where: { EmpresaId: companyId, ano_exercicio: ano_exercicio }, raw: true })
      .then(result => {
        dre = result
      }).catch(err => {
        return Handler.Error({
          message: "Não foi possível encontrar DRE para esta empresa/ano"
        });
        return;
      });
    // Receitas
    // espera-se um range de -3/3 smiles points
    await Objetivo_Receitas.findOne({ where: { dreId: dre.id }, raw: true })
      .then(objetivo => {
        if (objetivo) {
          Analise_Objetivo_Receitas.findOne({ where: { objetivoReceitaId: objetivo.id } })
            .then(analise_objetivo => {
              total_preenchimento += 1
              total_smile_points += calcula_smile_points(analise_objetivo.smile_receita_bruta);
              total_smile_points += calcula_smile_points(analise_objetivo.smile_crescimento_quatro);
              total_smile_points += calcula_smile_points(analise_objetivo.smile_crescimento);
            })
        }
      })
    // Rentabilidade
    // Espera-se um range de -6/6 smile points
    await Objetivo_Rentabilidade.findOne({ where: { dreId: dre.id }, raw: true })
      .then(objetivo => {
        if (objetivo) {
          Analise_Objetivo_Rentabilidade.findOne({ where: { objetivoRentabilidadeId: objetivo.id } })
            .then(analise_objetivo => {
              total_preenchimento += 1
              total_smile_points += calcula_smile_points(analise_objetivo.smile_lucro_liquido);
              total_smile_points += calcula_smile_points(analise_objetivo.smile_rentabilidade_media);
              total_smile_points += calcula_smile_points(analise_objetivo.smile_rentabilidade_ultimo);
              total_smile_points += calcula_smile_points(analise_objetivo.smile_ebitda_medio);
              total_smile_points += calcula_smile_points(analise_objetivo.smile_ebitda_ultimo);
            })
        }
      })
    // Endividamento
    // Espera-se um range de -3/3 smiles points
    await Objetivo_Endividamento.findOne({ where: { dreId: dre.id }, raw: true })
      .then(objetivo => {
        if (objetivo) {
          Analise_Objetivo_Endividamento.findOne({ where: { objetivoEndividamentoId: objetivo.id }, raw: true })
            .then(analise_objetivo => {
              if (analise_objetivo) {
                total_preenchimento += 1
                total_smile_points += calcula_smile_points(analise_objetivo.smile_divida);
                total_smile_points += calcula_smile_points(analise_objetivo.smile_taxa_divida_lucro);
                total_smile_points += calcula_smile_points(analise_objetivo.smile_inadimplencia);
              }
            })
        }
      })

    let porcentagem_financeiro = 1;
    porcentagem_financeiro += 9 * total_preenchimento;
    if (total_smile_points > 0) {
      porcentagem_financeiro += 6 * total_smile_points;
    }

    // TODO: atualmente são 10 questões, mas precisa mudar para uma tabela dinâmica
    let respostas = 10;
    let ponto_respostas = 0;
    let num_questoes = 0

    await Questionario_Swot.findAll({ where: { EmpresaId: companyId } }).then(questoes => {
      for (const questao of questoes) {
        if (questao.resposta == 0) { // sim
          ponto_respostas += 1;
        } else if (questao.resposta == 2) { // não
          ponto_respostas -= 1
        }
        num_questoes += 1;
      }
    })

    let porcentagem_sobrevivencia = respostas * (30 / num_questoes);
    if (ponto_respostas > 0) {
      porcentagem_sobrevivencia += ponto_respostas * (70 / num_questoes);
    }

    let porcentagem_gestao = 1
    porcentagem_gestao += 33 * total_preenchimento

    let porcentagem_resultado = 4
    if (total_smile_points > 0)
      porcentagem_resultado += 8 * total_smile_points

    return Handler.Ok({
      status: "success",
      'porcentagem_diagnostico': parseInt((porcentagem_financeiro + porcentagem_sobrevivencia) / 2),
      'porcentagem_estrategia': parseInt((porcentagem_gestao + porcentagem_resultado) / 2)
    });

  } catch (error) {
    console.log(error)
    return Handler.Error({
      message: "Erro executando comando no servidor",
    })
  }
}