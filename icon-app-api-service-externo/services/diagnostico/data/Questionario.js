'use strict';

const models = require('../../models');
const Questionario = models.Questionario_Swot;

/**
 * Setup
 */
exports.setup = async (empresa, ano) => {
  return new Promise(async (resolve, reject) => {

    const data = [
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        descricao: "Sua empresa possui um objetivo de médio e longo prazo e você se sente preparado para gerir seu negócio nesta direção em um ambiente de rápida transformação?",
        resposta_sim: 0,
        resposta_maisoumnenos: 0,
        resposta_nao: 0,
        peso: 12

      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        descricao: "Você confia na sua equipe para vencer os desafios futuros do seu negócio?",
        resposta_sim: 0,
        resposta_maisoumnenos: 0,
        resposta_nao: 0,
        peso: 10
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        descricao: "Você confia nos seus controles financeiros para gerir sua empresa nos próximos 12 meses?",
        resposta_sim: 0,
        resposta_maisoumnenos: 0,
        resposta_nao: 0,
        peso: 9
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        descricao: "Sua empresa tem uma visão e um plano de marketing alinhada com seu público alvo e com seus objetivos estratégicos?",
        resposta_sim: 0,
        resposta_maisoumnenos: 0,
        resposta_nao: 0,
        peso: 9
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        descricao: "Sua empresa é capaz de inovar na mesma velocidade em que o mercado muda?",
        resposta_sim: 0,
        resposta_maisoumnenos: 0,
        resposta_nao: 0,
        peso: 12
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        descricao: "Você é senhor do seu tempo?",
        resposta_sim: 0,
        resposta_maisoumnenos: 0,
        resposta_nao: 0,
        peso: 9
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        descricao: "O seu sofrimento, inerente ao empreendedorismo, tem se convertido em aprendizado?",
        resposta_sim: 0,
        resposta_maisoumnenos: 0,
        resposta_nao: 0,
        peso: 9
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        descricao: "Você acredita na qualidade da comunicação, e no clima de confiança em sua empresa para atingir os objetivos?",
        resposta_sim: 0,
        resposta_maisoumnenos: 0,
        resposta_nao: 0,
        peso: 10
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        descricao: "Você percebe em sua empresa, conflitos de Egos que afetem o bom desempenho?",
        resposta_sim: 0,
        resposta_maisoumnenos: 0,
        resposta_nao: 0,
        peso: 8
      },
      {
        EmpresaId: empresa,
        ano_exercicio: ano,
        descricao: "A empresa conhece e compreende claramente as necessidades de seus clientes?",
        resposta_sim: 0,
        resposta_maisoumnenos: 0,
        resposta_nao: 0,
        peso: 12
      },
    ];

    for (let i=0; i<data.length; i++) {
      const item = data[i]
      await Questionario.create(item)
          .then(result => {
            console.log(`Questionário: questão [${item.descricao}] adicionado com sucesso.`,);
          })
          .catch(err => {
            console.log(`Questionário: erro adicionando questão [${item.descricao}].`, err);
          });
    }

    resolve(null);
  });
};
