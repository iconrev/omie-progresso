const Handler = require("../handler");
const Models = require("../../models");
const { ConvertStringToFloat } = require("../generico/ConvertStringToFloat");
const {
  LimiteDeEstrategias,
  SalvarAtualizarEstrategias,
  getEstrategiasDisponiveis,
  getEstrategiasCadastradas,
} = require("../generico/FuncoesDeEstrategias");

module.exports.definicaoEndividamento = async (event, action) => {
  const { company } = action;
  const exercises = await company.getExercises();
  const estrategiasDisponiveis = await getEstrategiasDisponiveis(
    "financeiro",
    "endividamento"
  );

  const metas = {};

  const promises = exercises.map(async (exercise) => {
    const dre = await company.getDreByYear(exercise - 1);

    if (dre) {
      const dataYear = {};

      const objetivoEndividamento =
        await company.getObjetivoEndividamentoByDreId(dre.id);

      if (objetivoEndividamento) {
        dataYear.status = "success";
        dataYear.objetivos = objetivoEndividamento;
        dataYear.estrategias_definidas = await getEstrategiasCadastradas(
          company.id,
          dre.id,
          "financeiro",
          "endividamento"
        );
      } else {
        dataYear.status = "objectives_not_found";
        dataYear.message = "Nenhum dado localizado";
      }

      metas[exercise] = dataYear;
    } else {
      metas[exercise] = {
        status: "dre_not_found",
        message: "DRE não localizado",
      };
    }
  });

  await Promise.all(promises);

  return Handler.Ok({
    metas,
    estrategias_disponiveis: estrategiasDisponiveis,
    limite_estrategias: LimiteDeEstrategias(),
  });
};

module.exports.salvarMeta = async (event, action) => {
  const { companyId } = action;

  const { objetivo, estrategias } = JSON.parse(event.body);
  const queryEmpresa = {
    where: {
      EmpresaId: companyId,
      dreId: objetivo.dreId,
    },
    raw: true,
  };
  objetivo.EmpresaId = companyId;
  objetivo.meta_reducao_divida = ConvertStringToFloat(
    objetivo.meta_reducao_divida
  );
  objetivo.meta_reducao_inadimplencia = ConvertStringToFloat(
    objetivo.meta_reducao_inadimplencia
  );

  const result = await Models.Objetivo_Endividamento.findOne(queryEmpresa);

  if (result) {
    await Models.Objetivo_Endividamento.update(objetivo, {
      where: { id: result.id },
      raw: true,
    });
    await SalvarAtualizarEstrategias(
      "financeiro",
      "endividamento",
      estrategias,
      companyId,
      objetivo.dreId
    );
  } else {
    await Models.Objetivo_Endividamento.create(objetivo);

    await SalvarAtualizarEstrategias(
      "financeiro",
      "endividamento",
      estrategias,
      companyId,
      objetivo.dreId
    );
  }

  return Handler.Ok({
    message: "Objetivo de Endividamento atualizado com sucesso",
  });
};
