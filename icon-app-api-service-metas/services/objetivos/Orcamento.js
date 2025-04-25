const Handler = require("../handler");
const models = require("../../models");

const { Objetivo_Custo_Mensal } = models;
const meses = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

function roundDecimal(value, decimals = 2) {
  return parseFloat(value.toFixed(decimals));
}

module.exports.orcamento_mensal = async (event, action) => {
  const { company, companyId } = action;
  const exercises = await company.getExercises();

  const metas = {};

  const promises = exercises.map(async (exercise) => {
    const dre = await company.getDreByYear(exercise - 1);
    if (!dre) {
      metas[exercise] = {
        status: "dre_not_found",
        message: "DRE não localizado",
      };
      return;
    }

    const [rentabilidade, receitas, custos] = await Promise.all([
      company.getObjetivoRentabilidadeByDreId(dre.id),
      company.getObjetivoReceitasByDreId(dre.id),
      company.getObjetivoCustosByDreId(dre.id),
    ]);

    if (!custos) {
      metas[exercise] = {
        status: "objectives_not_found",
        messsage: "Nenhum objetivo localizado",
      };
      return;
    }

    const receitaBrutaProximoAno = receitas.meta;
    const impostoProximoAno = parseFloat(
      ((receitas.meta * parseFloat(custos.imposto_definido)) / 100).toFixed(2)
    );
    const lucroLiquidoRentabilidade = rentabilidade.meta_rentabilidade;

    // valor total liquido disponível para CUSTO a ser distribuido entre as despesas (10 no total)
    const orcamentoDespesaProximoAno =
      receitaBrutaProximoAno -
      impostoProximoAno -
      lucroLiquidoRentabilidade -
      custos.depreciacao_amortizacao_definido -
      custos.imposto_sobre_lucro_definido;

    const superavit = receitaBrutaProximoAno - orcamentoDespesaProximoAno;

    // informações que serão formatadas.
    const fields = dre.despesas.map((despesa) => despesa.field);
    const header = dre.despesas.map((despesa) => despesa.description);

    // calcula todos os meses do ano com base no percentual distribuido para cada
    // despesa no objetivo.
    const filterCompany = {
      where: {
        EmpresaId: companyId,
        ano_exercicio: exercise,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "id", "EmpresaId", "ano_exercicio"],
      },
      raw: true,
    };
    const custosMensal = await Objetivo_Custo_Mensal.findAll(filterCompany);
    if (custosMensal.length === 0) {
      for (let index = 0; index < fields.length; index++) {
        const element = fields[index];
        const title = header[index];
        const custoElement = custos.despesas.find(
          (despesa) => despesa.description === element
        );
        const rateio = roundDecimal(
          custoElement ? custoElement.value / 12 || 0 : 0
        );

        const data = {
          despesa: title,
          EmpresaId: companyId,
          total: custoElement ? custoElement.value : 0,
          campo_: element,
          ano_exercicio: exercise,
        };

        // obtemos o mês atualizamos o valor correspondente
        // eslint-disable-next-line no-restricted-syntax
        for (const mes of meses) {
          data[mes] = rateio;
        }

        const diff = roundDecimal(rateio * 12 - data.total);
        data.dez -= diff;

        // eslint-disable-next-line no-await-in-loop
        await Objetivo_Custo_Mensal.create(data);
      }
    }

    // obtem as despesas mensais, de cada despesa especifica
    const orcamento =
      custosMensal.length > 0
        ? custosMensal
        : await Objetivo_Custo_Mensal.findAll(filterCompany);

    metas[exercise] = {
      custo_total: orcamentoDespesaProximoAno,
      receita_bruta: receitaBrutaProximoAno,
      superavit,
      orcamento,
      receita: receitas,
      lucro_liquido_previsto: lucroLiquidoRentabilidade,
    };
  });

  await Promise.all(promises);

  return Handler.Ok({
    metas,
  });
};

module.exports.salvarOrcamento = async (event, action) => {
  const body = JSON.parse(event.body);
  const { companyId } = action;

  if (!Array.isArray(body)) {
    return Handler.BadRequest({
      message: "Conteúdo enviado não pode ser interpretado.",
    });
  }

  const promises = body.map(async (data) => {
    const { despesa, year } = data;

    const filter = {
      where: {
        EmpresaId: companyId,
        campo_: data['campo_'],
        ano_exercicio: year,
      },
      raw: true,
    };

    await Objetivo_Custo_Mensal.update(data, filter)
      .then(console.info(`Despesa ${despesa} salva com sucesso.`))
      .catch((e) =>
        console.info(`Ocorreu um problema ao salvar a despesa ${despesa}:`, e)
      );
  });

  await Promise.all(promises);

  return Handler.Ok({
    message: `Orçamento atualizado com sucesso.`,
  });
};
