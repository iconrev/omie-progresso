/* eslint-disable no-param-reassign */
const { QueryTypes } = require("sequelize");
const Handler = require("./handler");
const models = require("../models");

const { sequelize, Processos } = models;
const {
  LimiteDeEstrategias,
  SalvarAtualizarEstrategias,
  getEstrategiasDisponiveis,
  getEstrategiasCadastradas,
} = require("./generico/FuncoesDeEstrategias");
const { ConvertStringToFloat } = require("./generico/ConvertStringToFloat");
const { buscarMetaFinanceiro } = require("./generico/BuscarMetaFinanceiro");
const { getDadosAnteriores } = require("./generico/DadosAnteriores");
const {
  SuggestionIncrease,
  SuggestionRule,
  SuggestionIncreaseValue,
} = require("./generico/SuggestionRule");
const getModel = require("./generico/GetModel");

const getObjectives = (result) => {
  console.info("Buscando objetivos e avaliações");

  delete result.createdAt;
  delete result.updatedAt;

  return result;
};

const getOtherObjectives = async (
  perspectiva,
  categoria,
  filterCompany,
  meta_receitas,
  objetivos_categoria,
  ano_exercicio
) => {
  const empresaId = {
    replacements: [filterCompany.where.EmpresaId, ano_exercicio - 1],
    type: QueryTypes.SELECT,
  };
  let objetivos;
  const dadosAnteriores = await getDadosAnteriores(
    perspectiva,
    filterCompany.where.EmpresaId,
    ano_exercicio - 1
  );

  if (categoria === "produtividade") {
    const custoFolha = meta_receitas.despesas_com_pessoal || 0;
    const receitaBruta = meta_receitas.meta || 0;

    const sugestao_receita_bruta_custo_folha =
      custoFolha > 0 && receitaBruta > 0 ? receitaBruta / custoFolha : 0;

    objetivos = {
      sugestao_receita_bruta_custo_folha,
      sugestao_quantidade_entregue_funcionarios: SuggestionIncrease(),
    };
  }

  if (categoria === "qualidade") {
    const sugestao_refugo_retrabalho = SuggestionRule(
      dadosAnteriores.refugo_retrabalho,
      true
    );

    let sugestao_custos_garantia = 0;

    await sequelize
      .query(
        `
            SELECT 
                Dre.ano_exercicio,
                (Dre.receita_produto + Dre.receita_servico + Dre.outras_receitas) as receita_bruta_anterior
            FROM 
                Dre    
            WHERE
                Dre.EmpresaId = ? and Dre.ano_exercicio = ?
            ORDER BY
                Dre.ano_exercicio DESC`,
        empresaId
      )
      .then((result) => {
        if (result) {
          const dados = result[0];
          const custos_atual =
            (100 / dados.receita_bruta_anterior) *
            dadosAnteriores.custos_garantia;
          sugestao_custos_garantia = SuggestionRule(custos_atual, true);
        }
      });

    objetivos = {
      sugestao_refugo_retrabalho,
      sugestao_custos_garantia,
    };
  }

  if (categoria === "eficiencia") {
    const { volume_produzido_no_ano } = dadosAnteriores;
    const { capacidade_produzida } = dadosAnteriores;

    const capacidade_anterior =
      (volume_produzido_no_ano / capacidade_produzida) * 100;
    const sugestao_capacidade_produtiva = SuggestionRule(capacidade_anterior);

    const eficiencia_anterior =
      100 - dadosAnteriores.percentual_disponibilidade_equipamento;
    const sugestao_eficiencia_operacional = SuggestionRule(eficiencia_anterior);

    objetivos = {
      sugestao_capacidade_produtiva,
      sugestao_eficiencia_operacional,
    };
  }

  if (categoria === "logistica") {
    const sugestao_entregas_prazo = SuggestionRule(
      dadosAnteriores.entregas_no_prazo
    );

    const sugestao_valor_estoque = SuggestionIncreaseValue(
      dadosAnteriores.valor_do_estoque,
      meta_receitas.percentagem
    );

    objetivos = {
      sugestao_entregas_prazo,
      sugestao_valor_estoque,
    };
  }

  return objetivos;
};

const cleanFields = (categoria, objetivo, companyId) => {
  objetivo.EmpresaId = companyId;

  if (categoria === "produtividade") {
    objetivo.quantidade_entregue_funcionarios_meta = ConvertStringToFloat(
      objetivo.quantidade_entregue_funcionarios_meta
    );
    objetivo.quantidade_entregue_funcionarios_previsto = ConvertStringToFloat(
      objetivo.quantidade_entregue_funcionarios_previsto
    );
  }
  if (categoria === "qualidade") {
    objetivo.custos_garantia_meta = ConvertStringToFloat(
      objetivo.custos_garantia_meta
    );
    objetivo.custos_garantia_previsao = ConvertStringToFloat(
      objetivo.custos_garantia_previsao
    );
    objetivo.refugo_retrabalho_meta = ConvertStringToFloat(
      objetivo.refugo_retrabalho_meta
    );
    objetivo.refugo_retrabalho_previsao = ConvertStringToFloat(
      objetivo.refugo_retrabalho_previsao
    );
  }
  if (categoria === "eficiencia") {
    objetivo.capacidade_produtiva_meta = ConvertStringToFloat(
      objetivo.capacidade_produtiva_meta
    );
    objetivo.capacidade_produtiva_previsao = ConvertStringToFloat(
      objetivo.capacidade_produtiva_previsao
    );
    objetivo.eficiencia_meta = ConvertStringToFloat(objetivo.eficiencia_meta);
    objetivo.eficiencia_previsao = ConvertStringToFloat(
      objetivo.eficiencia_previsao
    );
  }

  if (categoria === "logistica") {
    objetivo.entrega_prazo_meta = ConvertStringToFloat(
      objetivo.entrega_prazo_meta
    );
    objetivo.entrega_prazo_previsao = ConvertStringToFloat(
      objetivo.entrega_prazo_previsao
    );
    objetivo.valor_estoque_meta = ConvertStringToFloat(
      objetivo.valor_estoque_meta
    );
    objetivo.valor_estoque_previsao = ConvertStringToFloat(
      objetivo.valor_estoque_previsao
    );
    objetivo.giro_estoque_meta = ConvertStringToFloat(
      objetivo.giro_estoque_meta
    );
    objetivo.giro_estoque_previsao = ConvertStringToFloat(
      objetivo.giro_estoque_previsao
    );
  }

  return objetivo;
};

module.exports.salvarMeta = async (event, action) => {
  const { companyId } = action;
  const { perspectiva, categoria } = event.pathParameters;

  const model = await getModel.byCategory(categoria);
  if (model === undefined) {
    return Handler.Error({
      message: `Categoria desconhecida`,
    });
  }

  const { objetivo, estrategias } = JSON.parse(event.body);
  const objetivoClean = cleanFields(categoria, objetivo, companyId);

  const queryEmpresa = {
    where: {
      EmpresaId: companyId,
      processoId: objetivo.processoId,
    },
    raw: true,
  };
  const result = await model.findOne(queryEmpresa);
  if (result) {
    await model.update(objetivoClean, queryEmpresa);
  } else {
    await model.create(objetivoClean);
  }

  await SalvarAtualizarEstrategias(
    perspectiva,
    categoria,
    estrategias,
    companyId,
    objetivo.processoId
  );

  return Handler.Ok({
    message: "Metas atualizadas com sucesso",
  });
};

module.exports.definicao = async (event, action) => {
  const { company, companyId } = action;
  const { perspectiva, categoria } = event.pathParameters;
  const anos = await company.getExercises();
  const estrategias_disponiveis = await getEstrategiasDisponiveis(
    perspectiva,
    categoria
  );
  const model = await getModel.byCategory(categoria);
  const metas = {};

  const promises = [];

  const run = async (ano) => {
    ano = parseInt(ano, 10);

    const { idParent, message, status } = await getModel.tableParent(
      companyId,
      ano - 1,
      Processos
    );

    if (status === "success") {
      const filterCompany = {
        where: {
          EmpresaId: companyId,
          processoId: idParent,
        },
        raw: true,
      };
      let statusResponse;
      let messageResponse;
      let objetivos;
      let estrategias_definidas;

      const meta_receitas = await buscarMetaFinanceiro(company, ano - 1);
      if (meta_receitas) {
        await model
          .findOne(filterCompany)
          .then(async (result) => {
            if (result) {
              statusResponse = "success";
              messageResponse = "Dados anteriores encontrados.";
              objetivos = getObjectives(result);
              estrategias_definidas = await getEstrategiasCadastradas(
                companyId,
                result.processoId,
                perspectiva,
                categoria
              );
            } else {
              statusResponse = "goals_not_found";
              messageResponse =
                "Não foi localizado nenhum dado previamente preenchido.";
            }

            const outros_objetivos = await getOtherObjectives(
              perspectiva,
              categoria,
              filterCompany,
              meta_receitas,
              objetivos,
              ano
            );

            metas[ano] = {
              status: statusResponse,
              message: messageResponse,
              objetivo: objetivos,
              outros_objetivos,
              estrategias_definidas,
              meta_receitas,
            };
          })
          .catch((err) => {
            console.error("Erro ao buscar Definição:", err);
            metas[ano] = {
              status: "fatal_error",
              message: `Ocorreu um problema ao buscar a definição anterior.`,
            };
          });
      } else {
        metas[ano] = {
          status: "objectives_not_found",
          message: "Não foi localizar os objetivos Financeiros.",
        };
      }
    } else {
      metas[ano] = {
        status,
        message,
      };
    }
  };

  anos.map((ano) => promises.push(run(ano)));

  await Promise.all(promises);

  return Handler.Ok({
    metas,
    limite_estrategias: LimiteDeEstrategias(),
    estrategias_disponiveis,
  });
};
