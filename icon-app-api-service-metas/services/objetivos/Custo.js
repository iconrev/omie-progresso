const Handler = require("../handler");
const Models = require("../../models");
const {
  LimiteDeEstrategias,
  SalvarAtualizarEstrategias,
  getEstrategiasDisponiveis,
  getEstrategiasCadastradas,
} = require("../generico/FuncoesDeEstrategias");
const { DRE_Despesa } = require("../../auth/CompanyService");

async function atualizarCustosMensais(companyId, dreId) {
  const filterDre = {
    where: {
      EmpresaId: companyId,
      id: dreId,
    },
    raw: true,
  };
  await Models.Dre.findOne(filterDre)
    .then(async (result) => {
      if (result) {
        const anoExercicio = parseInt(result.ano_exercicio, 10) + 1;

        const filterCompany = {
          where: {
            EmpresaId: companyId,
            ano_exercicio: anoExercicio,
          },
          raw: true,
        };
        await Models.Objetivo_Custo_Mensal.findOne(filterCompany)
          .then(async (dados) => {
            if (dados) {
              await Models.Objetivo_Custo_Mensal.destroy({
                where: { EmpresaId: companyId, ano_exercicio: anoExercicio },
              })
                .then(() =>
                  console.info(
                    "Valores de custos mensais excluidos com sucesso!"
                  )
                )
                .catch(() => console.error("Erro excluindo os custos mensais"));
            } else {
              console.warn("OBJETIVO NÃO ENCONTRADO");
            }
          })
          .catch((e) => console.error("Problemas ao buscar dados:", e));
      } else {
        console.info("Nenhum DRE encontrado");
      }
    })
    .catch((err) => {
      console.error("Erro ao buscar DRE", err);
    });
}

async function atualizarObjetivoDespesas(objetivo) {
  const filterDespesas = {
    where: {
      objetivo_id: objetivo.id,
    },
  };
  await Models.Objetivo_Custos_Despesas.destroy(filterDespesas);

  const despesasKey = Object.keys(objetivo.despesas);

  const promises = despesasKey.map(async (despesaKey) => {
    const despesaValue = objetivo.despesas[despesaKey];

    const payload = {
      objetivo_id: objetivo.id,
      description: despesaKey,
      value: despesaValue,
    };

    const dreDespesa = await DRE_Despesa.findBy(objetivo.dreId, despesaKey);
    if (dreDespesa) {
      payload.despesa_id = dreDespesa.id;
    }

    await Models.Objetivo_Custos_Despesas.create(payload);
    console.info("Despesa adicionada com sucesso");
  });

  await Promise.all(promises);

  console.info("Despesas atualizadas com sucesso");
}

module.exports.objetivo = async (event, action) => {
  const { company, companyId } = action;
  const { estrategias, objetivo } = JSON.parse(event.body);

  const dre = await company.getDreById(objetivo.dreId);

  if (!dre) {
    return Handler.BadRequest({
      message: "Dados inválidos",
    });
  }

  objetivo.EmpresaId = companyId;

  const result = await company.getObjetivoCustosByDreId(dre.id);

  if (result) {
    await Models.Objetivo_Custos.update(objetivo, {
      where: { id: result.id },
      raw: true,
    });
    objetivo.id = result.id;
  } else {
    const objetivoNovo = await Models.Objetivo_Custos.create(objetivo);
    objetivo.id = objetivoNovo.id;
  }

  await atualizarObjetivoDespesas(objetivo);
  await atualizarCustosMensais(companyId, objetivo.dreId);
  await SalvarAtualizarEstrategias(
    "financeiro",
    "custos",
    estrategias,
    companyId,
    objetivo.dreId
  );

  return Handler.Ok({
    message: "Objetivo de Custos e Desepesas atualizado com sucesso",
  });
};

module.exports.orcamento_percentual_despesas = async (event, action) => {
  const { company } = action;
  const exercises = await company.getExercises();
  const estrategiasDisponiveis = await getEstrategiasDisponiveis(
    "financeiro",
    "custos"
  );

  const metas = {};

  const promises = exercises.map(async (exercise) => {
    const dre = await company.getDreByYear(exercise - 1);

    if (dre) {
      const [objetivoReceitas, objetivoRentabildade, objetivoCustos] =
        await Promise.all([
          company.getObjetivoReceitasByDreId(dre.id),
          company.getObjetivoRentabilidadeByDreId(dre.id),
          company.getObjetivoCustosByDreId(dre.id),
        ]);

      const dataYear = {
        receita: objetivoReceitas,
        rentabilidade: objetivoRentabildade,
      };

      if (objetivoCustos) {
        dataYear.status = "success";
        dataYear.objetivos = objetivoCustos;
        dataYear.estrategias_definidas = await getEstrategiasCadastradas(
          company.id,
          dre.id,
          "financeiro",
          "custos"
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
