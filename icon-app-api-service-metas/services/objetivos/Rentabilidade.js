const Handler = require("../handler");
const models = require("../../models");
const { Objetivo_Rentabilidade, Dre } = models;
const { ConvertStringToFloat } = require("../generico/ConvertStringToFloat");
const {
  LimiteDeEstrategias,
  SalvarAtualizarEstrategias,
  getEstrategiasDisponiveis,
  getEstrategiasCadastradas,
} = require("../generico/FuncoesDeEstrategias");
const AnoExercicioEmpresa = require("../generico/AnoExercicioEmpresa");

module.exports.criar = async (event, action) => {
  const { companyId } = action;
  const { objetivo, estrategias } = JSON.parse(event.body);
  const queryEmpresa = {
    where: { EmpresaId: companyId, dreId: objetivo.dreId },
    raw: true,
  };
  objetivo.EmpresaId = companyId;
  objetivo.rentabilidade_percentage = ConvertStringToFloat(
    objetivo.rentabilidade_percentage
  );
  objetivo.ebitda_percentage = ConvertStringToFloat(objetivo.ebitda_percentage);
  objetivo.meta_rentabilidade = ConvertStringToFloat(
    objetivo.meta_rentabilidade
  );
  objetivo.meta_lucro = ConvertStringToFloat(objetivo.meta_lucro);

  const result = await Objetivo_Rentabilidade.findOne(queryEmpresa);

  if (result) {
    await Objetivo_Rentabilidade.update(objetivo, {
      where: { id: result.id },
      raw: true,
    });

    await SalvarAtualizarEstrategias(
      "financeiro",
      "rentabilidade",
      estrategias,
      companyId,
      objetivo.dreId
    );
  } else {
    await Objetivo_Rentabilidade.create(objetivo);
    await SalvarAtualizarEstrategias(
      "financeiro",
      "rentabilidade",
      estrategias,
      companyId,
      objetivo.dreId
    );
  }
  return Handler.Ok({
    message: "Objetivo de Rentabilidade atualizado com sucesso",
  });
};

exports.definicao_rentabilidade = async (event, action) => {
  const { companyId } = event.pathParameters;
  const anos = await AnoExercicioEmpresa.getAll(companyId);

  const estrategias_disponiveis = await getEstrategiasDisponiveis(
    "financeiro",
    "rentabilidade"
  );
  const metas = {};

  for (let ano of anos) {
    ano = parseInt(ano);

    let dreId, message;
    let status = "fatal_error";

    let filterDre = {
      where: {
        EmpresaId: companyId,
        ano_exercicio: ano - 1,
      },
    };
    await Dre.findOne(filterDre)
      .then((result) => {
        if (result) {
          dreId = result.id;
          status = "success";
        } else {
          console.info("Nenhum DRE encontrado");
          status = "dre_not_found";
          message = "DRE não localizado";
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar DRE", err);
        message = "Erro ao buscar DRE";
      });

    let objetivos, estrategias_definidas;
    message = undefined;
    const filterCompany = {
      where: {
        EmpresaId: companyId,
        dreId: dreId,
      },
    };

    status = "fatal_error";

    await Objetivo_Rentabilidade.findOne(filterCompany)
      .then(async (objetivo) => {
        if (objetivo) {
          status = "success";
          objetivos = {
            objetivoRentabilidadeId: objetivo.id,
            rentabilidade_percentage: objetivo.rentabilidade_percentage,
            ebitda_percentage: objetivo.ebitda_percentage,
            tipo: objetivo.tipo,
            dreId: objetivo.dreId,
            descricao: objetivo.descricao,
          };
          estrategias_definidas = await getEstrategiasCadastradas(
            companyId,
            objetivo.dreId,
            "financeiro",
            "rentabilidade"
          );
        } else {
          status = "objectives_not_found";
          message = "Não há objetivos cadastrado para Rentabilidade";
        }
      })
      .catch((err) => {
        console.error("definicao_objetivo_financeiro", err);
      });

    metas[ano] = {
      status: status,
      message: message,
      objetivo: objetivos,
      estrategias_definidas: estrategias_definidas,
    };
  }

  return Handler.Ok({
    metas: metas,
    estrategias_disponiveis: estrategias_disponiveis,
    limite_estrategias: LimiteDeEstrategias(),
  });
};
