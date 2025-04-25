const models = require("../../../models");
const { DiagnosticoExternoAvaliacao } = models;
const Handler = require("../../handler");
const AnoExercicioEmpresa = require("../../generico/AnoExercicioEmpresa");

module.exports.diagnostico = async (event, action) => {
  const { companyId } = event.pathParameters;

  try {
    const anos = await AnoExercicioEmpresa.getAll(companyId);
    const avaliacao = {};

    for (const ano of anos) {
      let filter = {
        where: {
          EmpresaId: companyId,
          ano_exercicio: ano,
        },
      };
      await DiagnosticoExternoAvaliacao.findAll(filter)
        .then(async (result) => {
          if (result.length > 0) {
            let concorrentes = parseFloat(result[0].concorrentes) || 0;
            let clientes = parseFloat(result[0].clientes) || 0;
            let fornecedores = parseFloat(result[0].fornecedores) || 0;
            let macro = parseFloat(result[0].macro) || 0;
            let media =
              (concorrentes + clientes + fornecedores + macro) / 4 / 100;

            let texto = "";
            if (media < 0.19) {
              texto =
                "* Altíssima vulnerabilidade por fatores externos ao negócio.";
            } else if (media >= 0.19 && media < 0.4) {
              texto = "* Alta vulnerabilidade por fatores externos ao negócio.";
            } else if (media >= 0.4 && media < 0.6) {
              texto =
                "* Vulnerabilidade média por fatores externos ao negócio.";
            } else if (media >= 0.6 && media < 0.8) {
              texto =
                "* Baixa vulnerabilidade por fatores externos ao negócio.";
            } else {
              texto =
                "* Baixissima vulnerabilidade por fatores externos ao negócio.";
            }

            avaliacao[ano] = {
              percentual: media,
              texto: texto,
            };
          } else {
            avaliacao[ano] = {
              percentual: 0,
              texto:
                "* Altíssima vulnerabilidade por fatores externos ao negócio.",
            };
          }
        })
        .catch((err) => {
          console.error("Erro ao buscar diagnostico", e);
          avaliacao[ano] = {
            percentual: 0,
            texto: "Erro ao buscar os dados",
          };
        });
    }

    return Handler.Ok({
      status: "success",
      avaliacao: avaliacao,
    });
  } catch (error) {
    return Handler.Exception(action, error);
  }
};
