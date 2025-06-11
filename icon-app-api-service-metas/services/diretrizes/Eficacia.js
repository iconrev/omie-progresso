const Handler = require("../handler");
const BuscarMetaFinanceiro = require("../generico/BuscarMetaFinanceiro");
const BuscarMetaComercial = require("../generico/BuscarMetaComercial");
const BuscarMetaProcessos = require("../generico/BuscarMetaProcessos");
const BuscarMetaPessoas = require("../generico/BuscarMetaPessoas");
const FuncoesDeEficacia = require("../generico/FuncoesDeEficacia");
const FuncoesDeQuestionario = require("../generico/FuncoesDeQuestionarios");
const ValidaMeta = require("../generico/ValidaMeta");

const tipoReal = { type: "currency" };
const tipoPercentage = { type: "percentage" };
const tipoInteger = { type: "integer" };
const tipoFloat = { type: "float" };

const meses = [
  { pos: 0, title: "Janeiro", id: "jan", checked: new Date().getMonth() <= 0 },
  {
    pos: 1,
    title: "Fevereiro",
    id: "fev",
    checked: new Date().getMonth() <= 1,
  },
  { pos: 2, title: "Março", id: "mar", checked: new Date().getMonth() <= 2 },
  { pos: 3, title: "Abril", id: "abr", checked: new Date().getMonth() <= 3 },
  { pos: 4, title: "Maio", id: "mai", checked: new Date().getMonth() <= 4 },
  { pos: 5, title: "Junho", id: "jun", checked: new Date().getMonth() <= 5 },
  { pos: 6, title: "Julho", id: "jul", checked: new Date().getMonth() <= 6 },
  { pos: 7, title: "Agosto", id: "ago", checked: new Date().getMonth() <= 7 },
  { pos: 8, title: "Setembro", id: "set", checked: new Date().getMonth() <= 8 },
  { pos: 9, title: "Outubro", id: "out", checked: new Date().getMonth() <= 9 },
  {
    pos: 10,
    title: "Novembro",
    id: "nov",
    checked: new Date().getMonth() <= 10,
  },
  {
    pos: 11,
    title: "Dezembro",
    id: "dez",
    checked: new Date().getMonth() <= 11,
  },
];

const mesesAvaliacao = {
  2: [1, 3, 5, 7, 9, 11],
  3: [2, 5, 8, 11],
  4: [3, 7, 11],
  6: [6, 11],
  12: [11],
};

const valuesBase = (idField, ano, data, quiz = false) => {
  const responseValuesBase = [];
  meses.forEach((mes) => {
    const idFieldKey = `${ano}_${idField}_${mes.id}`;
    let valor = quiz ? "NaoAvaliado" : 0.0;
    if (data[idFieldKey]) {
      valor = data[idFieldKey];
    }

    responseValuesBase.push({
      id: `${idField}_${mes.id}`,
      value: valor,
    });
  });
  return responseValuesBase;
};

const parseDre = async (dre, ano, company) => {
  const dreDiagnostico = await company.getDreByYear(ano - 1);

  if (dreDiagnostico === null) return null;

  const { despesas } = dreDiagnostico;

  const despesasResponse = [];
  despesas.forEach((despesa) => {
    if (!despesa.isDreDespesa) return;
    despesasResponse.push({
      title: despesa.description,
      values: valuesBase(despesa.field, ano, dre),
      id: despesa.field,
      tipo: "R$",
    });
  });
  // despesasResponse.filter((item) => item !== undefined);

  const response = [
    {
      categoria: "RECEITA BRUTA",
      tipo: "R$",
      id: "receita_bruta",
      itens: [
        {
          title: "Receita de Serviços",
          values: valuesBase("receita_servico", ano, dre),
          id: "receita_servico",
          tipo: "R$",
        },
        {
          title: "Receita de Produto",
          values: valuesBase("receita_produto", ano, dre),
          id: "receita_produto",
          tipo: "R$",
        },
        {
          title: "( + ) Outras Receitas",
          values: valuesBase("outras_receitas", ano, dre),
          id: "outras_receitas",
          tipo: "R$",
        },
      ],
    },
    {
      categoria: "DEDUÇÕES SOBRE RECEITAS",
      tipo: "R$",
      id: "deducao",
      itens: [
        {
          title: "Impostos sobre as receitas",
          values: valuesBase("imposto_sobre_receitas", ano, dre),
          id: "imposto_sobre_receitas",
          tipo: "R$",
        },
        {
          title: "Devolução e Abatimentos",
          values: valuesBase("devolucao_abatimentos", ano, dre),
          id: "devolucao_abatimentos",
          tipo: "R$",
        },
      ],
    },
    {
      categoria: "RECEITA LÍQUIDA",
      tipo: "R$",
      id: "receita_liquida",
    },
    {
      categoria: "CUSTOS",
      tipo: "R$",
      id: "custos",
      itens: [
        {
          title: "Custos de Mercadorias Vendidas",
          values: valuesBase("custo_dos_produtos_industrializados", ano, dre),
          id: "custo_dos_produtos_industrializados",
          tipo: "R$",
        },
      ],
    },
    {
      categoria: "LUCRO BRUTO",
      id: "lucro_bruto",
      tipo: "R$",
    },
    {
      categoria: "DESPESAS",
      tipo: "R$",
      id: "despesas",
      itens: despesasResponse,
    },
    {
      categoria: "EBITDA",
      tipo: "R$",
      id: "ebitda",
      itens: [
        {
          title: "( - ) Depreciação e Amortização",
          values: valuesBase("depreciacao_amortizacao", ano, dre),
          id: "depreciacao_amortizacao",
          tipo: "R$",
        },
      ],
    },
    {
      categoria: "RESULTADO FINANCEIRO",
      tipo: "R$",
      id: "resultado_financeiro",
      itens: [
        {
          title: "Receitas Financeiras",
          values: valuesBase("receitas_financeiras", ano, dre),
          id: "receitas_financeiras",
          tipo: "R$",
        },
        {
          title: "Despesas Financeiras",
          values: valuesBase("despesas_financeiras", ano, dre),
          id: "despesas_financeiras",
          tipo: "R$",
        },
      ],
    },
    {
      categoria: "LUCRO OPERACIONAL",
      tipo: "R$",
      id: "lucro_operacional",
      itens: [
        {
          title: "Imposto de Renda",
          values: valuesBase("imposto_de_renda", ano, dre),
          id: "imposto_de_renda",
          tipo: "R$",
        },
        {
          title: "Contribuição Social",
          values: valuesBase("constribuicao_social", ano, dre),
          id: "constribuicao_social",
          tipo: "R$",
        },
      ],
    },
    {
      categoria: "LUCRO/PREJUÍZO LÍQUIDO",
      tipo: "R$",
      id: "lucro_liquido",
    },
    {
      categoria: "INFORMAÇÕES FINANCEIRAS",
      tipo: "R$",
      id: "informacoes_financeiras",
      itens: [
        {
          title: "Valor da Dívida Total",
          values: valuesBase("endividamento", ano, dre),
          id: "endividamento",
          tip: "Valor da dívida total no dia 31/dez do exercício.",
          tipo: "R$",
        },
        {
          title: "Valor da Inadimplência Média Mensal",
          values: valuesBase("inadimplencia", ano, dre),
          id: "inadimplencia",
          tip: "Média de contas a receber em atraso na virada de cada mês do ano.",
          tipo: "R$",
        },
      ],
    },
  ];

  for (let i = 0; i < response.length; i++) {
    const categoria = response[i];
    const data = [];

    if (categoria.id !== "informacoes_financeiras") {
      meses.forEach((mes) => {
        const idFieldKey = `${categoria.id}_${mes.id}`;
        let valor = 0;

        if (categoria.itens) {
          if (categoria.id === "ebitda") {
            const receitaBruta = response.filter(
              (element) => element.id === "receita_bruta"
            )[0].data[mes.pos].value;
            const deducoes = response.filter(
              (element) => element.id === "deducao"
            )[0].data[mes.pos].value;
            const receitaLiquida = receitaBruta - deducoes;
            const custos = response.filter(
              (element) => element.id === "custos"
            )[0].data[mes.pos].value;
            const lucroBruto = receitaLiquida - custos;
            const despesasItem = response.filter(
              (element) => element.id === "despesas"
            )[0].data[mes.pos].value;
            valor = lucroBruto - despesasItem;
          } else if (categoria.id === "resultado_financeiro") {
            const receitasFinanceiras = response[7].itens.filter(
              (element) => element.id === "receitas_financeiras"
            )[0].values[mes.pos].value;
            const despesasFinanceiras = response[7].itens.filter(
              (element) => element.id === "despesas_financeiras"
            )[0].values[mes.pos].value;
            valor = receitasFinanceiras - despesasFinanceiras;
          } else if (categoria.id === "lucro_operacional") {
            const receitaBruta = response.filter(
              (element) => element.id === "receita_bruta"
            )[0].data[mes.pos].value;
            const deducoes = response.filter(
              (element) => element.id === "deducao"
            )[0].data[mes.pos].value;
            const receitaLiquida = receitaBruta - deducoes;
            const custos = response.filter(
              (element) => element.id === "custos"
            )[0].data[mes.pos].value;
            const lucroBruto = receitaLiquida - custos;
            const despesasItem = response.filter(
              (element) => element.id === "despesas"
            )[0].data[mes.pos].value;
            const ebitda = lucroBruto - despesasItem;
            const amortizacao = response.filter(
              (element) => element.id === "ebitda"
            )[0].itens[0].values[mes.pos].value;
            const receitasFinanceiras = response[7].itens.filter(
              (element) => element.id === "receitas_financeiras"
            )[0].values[mes.pos].value;
            const despesasFinanceiras = response[7].itens.filter(
              (element) => element.id === "despesas_financeiras"
            )[0].values[mes.pos].value;
            const resultadoFinanceiro =
              receitasFinanceiras - despesasFinanceiras;
            valor = ebitda + resultadoFinanceiro - amortizacao;
          } else {
            categoria.itens.forEach((item) => {
              const id = `${item.id}_${mes.id}`;
              const { value } = item.values.filter(
                (element) => element.id === id
              )[0];
              valor += value;
            });
          }
        } else {
          const receitaBruta = response.filter(
            (element) => element.id === "receita_bruta"
          )[0].data[mes.pos].value;
          const deducoes = response.filter(
            (element) => element.id === "deducao"
          )[0].data[mes.pos].value;
          let receitaLiquida = 0;
          let custos = 0;
          let lucroBruto = 0;
          let despesasItem = 0;
          let ebitda = 0;

          if (categoria.id === "receita_liquida") {
            receitaLiquida = receitaBruta - deducoes;
            valor = receitaLiquida;
          }
          if (categoria.id === "lucro_bruto") {
            receitaLiquida = receitaBruta - deducoes;
            custos = response.filter((element) => element.id === "custos")[0]
              .data[mes.pos].value;
            valor = receitaLiquida - custos;
          }
          if (categoria.id === "lucro_liquido") {
            receitaLiquida = receitaBruta - deducoes;
            custos = response.filter((element) => element.id === "custos")[0]
              .data[mes.pos].value;
            lucroBruto = receitaLiquida - custos;
            despesasItem = response.filter(
              (element) => element.id === "despesas"
            )[0].data[mes.pos].value;
            ebitda = lucroBruto - despesasItem;
            const amortizacao = response.filter(
              (element) => element.id === "ebitda"
            )[0].itens[0].values[mes.pos].value;
            const receitasFinanceiras = response[7].itens.filter(
              (element) => element.id === "receitas_financeiras"
            )[0].values[mes.pos].value;
            const despesasFinanceiras = response[7].itens.filter(
              (element) => element.id === "despesas_financeiras"
            )[0].values[mes.pos].value;
            const resultadoFinanceiro =
              receitasFinanceiras - despesasFinanceiras;
            const lucroOperacional = ebitda + resultadoFinanceiro - amortizacao;
            const impostoRenda = response[8].itens.filter(
              (element) => element.id === "imposto_de_renda"
            )[0].values[mes.pos].value;
            const contribuicaoSindical = response[8].itens.filter(
              (element) => element.id === "constribuicao_social"
            )[0].values[mes.pos].value;
            valor = lucroOperacional - impostoRenda - contribuicaoSindical;
          }
        }

        data.push({
          id: idFieldKey,
          value: valor,
        });
      });
    }

    categoria.data = data;
  }

  return response;
};

const getQuiz = async (perspectiva, ano, levantamento) => {
  const response = [];

  const questionarios = await FuncoesDeQuestionario.getQuizByPerspectiva(
    perspectiva
  );

  questionarios.forEach((quiz) => {
    const options_label = quiz["Questionarios_Avaliacao.label"]
      .split(";")
      .map((item) => item.trim());
    options_label.push("Não Avaliado");
    const options_value = quiz["Questionarios_Avaliacao.value"]
      .split(";")
      .map((item) => item.trim());
    options_value.push("NaoAvaliado");

    response.push({
      title: quiz.descricao,
      values: valuesBase(quiz.field, ano, levantamento, true),
      id: quiz.field,
      categoria: quiz.categoria,
      pespectiva: perspectiva,
      tipo: "quiz",
      options_label,
      options_value,
      mes_avaliacao: quiz.tempo_avaliacao,
    });
  });

  return response;
};

const parseLevantamento = async (levantamento, ano) => {
  const pessoasQuiz = await getQuiz("pessoas", ano, levantamento);
  const pessoasCompetencias = pessoasQuiz.filter(
    (element) => element.categoria === "competencias"
  );
  const pessoasEngajamento = pessoasQuiz.filter(
    (element) => element.categoria === "engajamento"
  );
  const pessoasRetencao = pessoasQuiz.filter(
    (element) => element.categoria === "retencao"
  );
  const comercialQuiz = await getQuiz("comercial", ano, levantamento);
  // const comercialRelacionamento = comercialQuiz.filter(
  //   (element) => element.categoria === "relacionamento"
  // );

  return [
    {
      perspectiva_nome: "Comercial",
      perspectiva: "comercial",
      itens: [
        {
          categoria_nome: "Marketing",
          categoria: "marketing",
          itens: [
            {
              title: "Carteira de Clientes Ativa",
              values: valuesBase(
                "marketing_clientes_ativos",
                ano,
                levantamento
              ),
              id: "marketing_clientes_ativos",
              tipo: null,
            },
            {
              title: "Novos Clientes no Mês",
              values: valuesBase("marketing_clientes_novos", ano, levantamento),
              id: "marketing_clientes_novos",
              tipo: null,
            },
            {
              title: "Base de Clientes Cadastrados",
              values: valuesBase(
                "marketing_clientes_cadastrados",
                ano,
                levantamento
              ),
              id: "marketing_clientes_cadastrados",
              tipo: null,
            },
          ],
        },
        {
          categoria_nome: "Vendas",
          categoria: "vendas",
          itens: [
            {
              title: "Propostas Enviadas",
              values: valuesBase(
                "comercial_propostas_enviadas",
                ano,
                levantamento
              ),
              id: "comercial_propostas_enviadas",
              tipo: null,
            },
            {
              title: "Propostas Aprovadas",
              values: valuesBase(
                "comercial_propostas_aprovadas",
                ano,
                levantamento
              ),
              id: "comercial_propostas_aprovadas",
              tipo: null,
            },
            {
              title: "Notas Fiscais Emitidas",
              values: valuesBase(
                "comercial_notas_fiscais_emitidas",
                ano,
                levantamento
              ),
              id: "comercial_notas_fiscais_emitidas",
              tipo: null,
            },
          ],
        },
        {
          categoria_nome: "Relacionamento",
          categoria: "relacionamento",
          itens: [
            {
              title: "Clientes Fidelizados",
              values: valuesBase(
                "relacionamento_clientes_fidelizados",
                ano,
                levantamento
              ),
              id: "relacionamento_clientes_fidelizados",
              tipo: null,
            },
            ...comercialQuiz,
          ],
        },
        {
          categoria_nome: "Satisfação",
          categoria: "satisfacao",
          itens: [
            {
              title: "Número de Reclamações",
              values: valuesBase(
                "satisfacao_numero_reclamacoes",
                ano,
                levantamento
              ),
              id: "satisfacao_numero_reclamacoes",
              tipo: null,
            },
            {
              title: "Clientes Perdidos",
              values: valuesBase(
                "satisfacao_clientes_perdidos",
                ano,
                levantamento
              ),
              id: "satisfacao_clientes_perdidos",
              tipo: null,
            },
          ],
        },
      ],
    },
    {
      perspectiva_nome: "Processos",
      perspectiva: "processos",
      itens: [
        {
          categoria_nome: "Produtividade",
          categoria: "produtividade",
          itens: [
            {
              title: "Número de Funcionários",
              values: valuesBase(
                "processos_numero_funcionarios",
                ano,
                levantamento
              ),
              id: "processos_numero_funcionarios",
              tipo: null,
            },
            {
              title: "Volume Produzido no mês",
              values: valuesBase(
                "processos_volume_produzido",
                ano,
                levantamento
              ),
              id: "processos_volume_produzido",
              tipo: null,
            },
          ],
        },
        {
          categoria_nome: "Qualidade",
          categoria: "qualidade",
          itens: [
            {
              title: "% Refugo Retrabalho",
              values: valuesBase(
                "processos_refugo_retrabalho",
                ano,
                levantamento
              ),
              id: "processos_refugo_retrabalho",
              tipo: "%",
            },
            {
              title: "Custos de Garantia",
              values: valuesBase(
                "processos_custos_garantia",
                ano,
                levantamento
              ),
              id: "processos_custos_garantia",
              tipo: "R$",
            },
          ],
        },
        {
          categoria_nome: "Eficiência",
          categoria: "eficiencia",
          itens: [
            {
              title: "Capacidade Produtiva Mensal",
              values: valuesBase(
                "processos_capacidade_produtiva",
                ano,
                levantamento
              ),
              id: "processos_capacidade_produtiva",
              tipo: null,
            },
            {
              title: "% Ociosidade de Equipamentos/Recursos",
              values: valuesBase("processos_ociosidade", ano, levantamento),
              id: "processos_ociosidade",
              tipo: "%",
            },
          ],
        },
        {
          categoria_nome: "Logística",
          categoria: "logistica",
          itens: [
            {
              title: "% Entregas no Prazo",
              values: valuesBase("processos_entregas_prazo", ano, levantamento),
              id: "processos_entregas_prazo",
              tipo: "%",
            },
            {
              title: "Valor Médio de Estoque",
              values: valuesBase(
                "processos_valor_medio_estoque",
                ano,
                levantamento
              ),
              id: "processos_valor_medio_estoque",
              tipo: "R$",
            },
          ],
        },
      ],
    },
    {
      perspectiva_nome: "Pessoas",
      tipo: null,
      perspectiva: "pessoas",
      id: "pessoas",
      itens: [
        {
          categoria_nome: "Indicadores",
          categoria: "indicadores",
          itens: [
            {
              title: "% Funcionários + 12 meses",
              values: valuesBase("indicadores_funcionarios", ano, levantamento),
              id: "indicadores_funcionarios",
              tipo: "%",
            },
            {
              title: "% Rotatividade",
              values: valuesBase("indicadores_rotatividade", ano, levantamento),
              id: "indicadores_rotatividade",
              tipo: "%",
            },
            {
              title: "% Absenteísmo",
              values: valuesBase("indicadores_absenteismo", ano, levantamento),
              id: "indicadores_absenteismo",
              tipo: "%",
            },
          ],
        },
        {
          categoria_nome: "Competências",
          categoria: "competencia",
          itens: pessoasCompetencias,
        },
        {
          categoria_nome: "Engajamento",
          categoria: "engajamento",
          itens: pessoasEngajamento,
        },
        {
          categoria_nome: "Retenção",
          categoria: "retencao",
          itens: pessoasRetencao,
        },
        {
          categoria_nome: "Inovação",
          categoria: "inovacao",
          itens: [
            {
              title: "% de faturamento oriundo da inovação",
              values: valuesBase("inovacao_faturamento", ano, levantamento),
              id: "inovacao_faturamento",
              tipo: "%",
            },
            {
              title: "Total de Inovações implementadas",
              values: valuesBase(
                "inovacao_total_implementado",
                ano,
                levantamento
              ),
              id: "inovacao_total_implementado",
              tipo: null,
            },
          ],
        },
      ],
    },
  ];
};

const getDashboardDefault = async (company, ano) => {
  const companyId = company.id;
  const response = [
    { id: "financeiro", title: "Financeiro", data: {} },
    { id: "comercial", title: "Comercial", data: {} },
    { id: "processos", title: "Processos", data: {} },
    { id: "pessoas", title: "Pessoas", data: {} },
  ];

  const questionarioRelacionamentoPromise =
    FuncoesDeQuestionario.getQuizByCategoria("relacionamento");
  const questionarioCompetenciasPromise =
    FuncoesDeQuestionario.getQuizByCategoria("competencias");
  const questionarioEngajamentoPromise =
    FuncoesDeQuestionario.getQuizByCategoria("engajamento");
  const questionarioRetencaoPromise =
    FuncoesDeQuestionario.getQuizByCategoria("retencao");

  const [
    questionarioRelacionamento,
    questionarioCompetencias,
    questionarioEngajamento,
    questionarioRetencao,
  ] = await Promise.all([
    questionarioRelacionamentoPromise,
    questionarioCompetenciasPromise,
    questionarioEngajamentoPromise,
    questionarioRetencaoPromise,
  ]);

  const mesesAvaliamRelacionamento =
    mesesAvaliacao[questionarioRelacionamento[0].tempo_avaliacao];
  const mesesAvaliamCompetencias =
    mesesAvaliacao[questionarioCompetencias[0].tempo_avaliacao];
  const mesesAvaliamEngajamento =
    mesesAvaliacao[questionarioEngajamento[0].tempo_avaliacao];
  const mesesAvaliamRetencao =
    mesesAvaliacao[questionarioRetencao[0].tempo_avaliacao];

  const metaReceita = await BuscarMetaFinanceiro.buscarMetaFinanceiro(
    company,
    ano - 1
  );
  const metaRentabilidade = await BuscarMetaFinanceiro.buscarMetaRentabilidade(
    company,
    ano - 1
  );
  const metaEndividamento = await BuscarMetaFinanceiro.buscarMetaEndividamento(
    company,
    ano - 1
  );
  const metaMarketing = await BuscarMetaComercial.buscarMetaMarketing(
    company,
    ano - 1
  );
  const metaVendas = await BuscarMetaComercial.buscarMetaVendas(
    company,
    ano - 1
  );
  const metaRelacionamento = await BuscarMetaComercial.buscarMetaRelacionamento(
    company,
    ano - 1
  );
  const metaSatisfacao = await BuscarMetaComercial.buscarMetaSatisfacao(
    company,
    ano - 1
  );
  const metaProdutividade = await BuscarMetaProcessos.buscarMetaProdutividade(
    company,
    ano - 1
  );
  const metaQualidade = await BuscarMetaProcessos.buscarMetaQualidade(
    company,
    ano - 1
  );
  const metaEficiencia = await BuscarMetaProcessos.buscarMetaEficiencia(
    company,
    ano - 1
  );
  const metaLogistica = await BuscarMetaProcessos.buscarMetaLogistica(
    company,
    ano - 1
  );
  const metaInovacao = await BuscarMetaPessoas.buscarMetaInovacao(
    company,
    ano - 1
  );
  const metaCompetencias = await BuscarMetaPessoas.buscarMetaCompetencias(
    company,
    ano - 1
  );
  const metaEngajamento = await BuscarMetaPessoas.buscarMetaEngajamento(
    company,
    ano - 1
  );
  const metaRetencao = await BuscarMetaPessoas.buscarMetaRetencao(
    company,
    ano - 1
  );

  const receitaBruta = {
    label: "Receita Bruta",
    data: [],
  };
  const rentabilidade = {
    label: "Rentabilidade",
    data: [],
  };
  const ebitda = {
    label: "EBITDA",
    data: [],
  };
  const custosMercadorias = {
    label: "Custos de Mercadorias Vendidas",
    data: [],
  };
  const despesas = {
    label: "Despesas sobre Receita Bruta",
    data: [],
  };
  const endividamento = {
    label: "Endividamento",
    data: [],
  };
  const inadimplencia = {
    label: "Inadimplência Mensal",
    data: [],
  };
  const clientes_ativos = {
    label: "Clientes Ativos",
    data: [],
  };
  const novos_clientes = {
    label: "Novos Clientes",
    data: [],
  };
  const taxa_conversao = {
    label: "Taxa de Conversão",
    data: [],
  };
  const ticket_medio = {
    label: "Ticket Médio",
    data: [],
  };
  const clientes_fidelizados = {
    label: "Clientes Fidelizados",
    data: [],
  };
  const nivel_relacionamento = {
    label: "Nível de Relacionamento",
    data: [],
  };
  const reclamacoes_recebidas = {
    label: "% Reclamações Recebidas por NF",
    data: [],
  };
  const clientes_perdidos = {
    label: "Clientes Perdidos",
    data: [],
  };
  const receita_custo = {
    label: "Receita Bruta / Custo Pessoal",
    data: [],
  };
  const entrega_funcionario = {
    label: "Entregas por Funcionário",
    data: [],
  };
  const refugo_retrabalho = {
    label: "% Refugo / retrabalho",
    data: [],
  };
  const custos_garantia = {
    label: "% Custos Garantia sobre Faturamento",
    data: [],
  };
  const capacidade_produtiva = {
    label: "% Capacidade Produtiva",
    data: [],
  };
  const eficiencia_operacional = {
    label: "% Eficiência Operacional",
    data: [],
  };
  const entregas_prazo = {
    label: "% Entregas no Prazo",
    data: [],
  };
  const valor_estoque = {
    label: "Valor de Estoque",
    data: [],
  };
  const giro_estoque = {
    label: "Giro de Estoque",
    data: [],
  };
  const inovacao = {
    label: "Inovações Implementadas",
    data: [],
  };
  const faturamento_inovacao = {
    label: "Faturamento destinado para Inovação",
    data: [],
  };
  const competencias_adquiridas = {
    label: "Competências Atuais / Adquiridas",
    data: [],
  };
  const engajamento = {
    label: "Nível de Engajamento",
    data: [],
  };
  const nivel_absenteismo = {
    label: "Nível de Absenteísmo",
    data: [],
  };
  const rotatividade = {
    label: "Rotatividade",
    data: [],
  };
  const funcionarios_antigos = {
    label: "Funcionários com mais de 12 meses",
    data: [],
  };
  const retencao = {
    label: "Nível de Retenção",
    data: [],
  };

  meses.forEach(async (mes) => {
    const dreMesPromise = FuncoesDeEficacia.getDreMensal(
      companyId,
      ano,
      mes.id
    );
    const levantamentoMesPromise = FuncoesDeEficacia.getLevantamento(
      companyId,
      ano,
      mes.id
    );

    const [dreMes, levantamentoMes] = await Promise.all([
      dreMesPromise,
      levantamentoMesPromise,
    ]);

    const receitaBrutaMes = dreMes[`${ano}_receita_bruta_${mes.id}`] || 0;

    receitaBruta.data.push(receitaBrutaMes);
    rentabilidade.data.push(dreMes[`${ano}_rentabilidade_${mes.id}`] || 0);
    ebitda.data.push(dreMes[`${ano}_ebitda_percentage_${mes.id}`] || 0);

    const custosMes =
      (100 / receitaBrutaMes) *
      dreMes[`${ano}_custo_dos_produtos_industrializados_${mes.id}`];
    const despesasMes =
      (100 / receitaBrutaMes) * dreMes[`${ano}_despesas_${mes.id}`];

    custosMercadorias.data.push(Math.round(custosMes * 100) / 100 || 0);
    despesas.data.push(Math.round(despesasMes * 100) / 100 || 0);
    endividamento.data.push(
      Math.round(dreMes[`${ano}_endividamento_${mes.id}`] * 100) / 100 || 0
    );

    const inadimplenciaMes =
      (100 / receitaBrutaMes) * dreMes[`${ano}_inadimplencia_${mes.id}`];

    inadimplencia.data.push(Math.round(inadimplenciaMes * 100) / 100 || 0);

    clientes_ativos.data.push(
      levantamentoMes[`${ano}_marketing_clientes_ativos_${mes.id}`] || 0
    );
    novos_clientes.data.push(
      levantamentoMes[`${ano}_marketing_clientes_novos_${mes.id}`] || 0
    );

    const propostasEnviadas =
      levantamentoMes[`${ano}_comercial_propostas_enviadas_${mes.id}`] || 0;
    const propostasAprovadas =
      levantamentoMes[`${ano}_comercial_propostas_aprovadas_${mes.id}`] || 0;
    const taxaConversao = (100 / propostasEnviadas) * propostasAprovadas;

    taxa_conversao.data.push(Math.round(taxaConversao) || 0);
    ticket_medio.data.push(
      Math.round(
        receitaBrutaMes /
          levantamentoMes[
            `${ano}_relacionamento_clientes_fidelizados_${mes.id}`
          ]
      ) || 0
    );
    clientes_fidelizados.data.push(
      Math.round(
        levantamentoMes[
          `${ano}_relacionamento_clientes_fidelizados_${mes.id}`
        ] || 0
      ) || 0
    );

    const notasEmitidas =
      levantamentoMes[`${ano}_comercial_notas_fiscais_emitidas_${mes.id}`] || 0;
    const reclamacoesRecebidas =
      levantamentoMes[`${ano}_satisfacao_numero_reclamacoes_${mes.id}`] || 0;
    const reclamacoes = (100 / notasEmitidas) * reclamacoesRecebidas;

    reclamacoes_recebidas.data.push(Math.round(reclamacoes * 100) / 100 || 0);
    clientes_perdidos.data.push(
      levantamentoMes[`${ano}_satisfacao_clientes_perdidos_${mes.id}`] || 0
    );

    const funcionarios =
      levantamentoMes[`${ano}_processos_numero_funcionarios_${mes.id}`] || 0;
    const entregas =
      levantamentoMes[`${ano}_processos_volume_produzido_${mes.id}`] || 0;
    const taxaEntrega = entregas / funcionarios;
    entrega_funcionario.data.push(Math.round(taxaEntrega * 100) / 100 || 0);

    const receitaCusto =
      Math.round((receitaBrutaMes / funcionarios) * 100) / 100;
    receita_custo.data.push(
      (receitaCusto === Infinity ? 0 : receitaCusto) || 0
    );
    refugo_retrabalho.data.push(
      levantamentoMes[`${ano}_processos_refugo_retrabalho_${mes.id}`] || 0
    );

    const custosGarantia =
      levantamentoMes[`${ano}_processos_custos_garantia_${mes.id}`] / 12 || 0;
    const taxaCustosGarantia = (100 / receitaBrutaMes) * custosGarantia;
    custos_garantia.data.push(Math.round(taxaCustosGarantia * 100) / 100 || 0);

    const capacidadeProdutiva =
      levantamentoMes[`${ano}_processos_capacidade_produtiva_${mes.id}`] || 0;
    const taxaCapacidadeProdutiva = (100 / capacidadeProdutiva) * entregas;
    capacidade_produtiva.data.push(
      Math.round(taxaCapacidadeProdutiva * 100) / 100 || 0
    );

    eficiencia_operacional.data.push(
      100 - levantamentoMes[`${ano}_processos_ociosidade_${mes.id}`] || 0
    );
    entregas_prazo.data.push(
      levantamentoMes[`${ano}_processos_entregas_prazo_${mes.id}`] || 0
    );
    valor_estoque.data.push(
      levantamentoMes[`${ano}_processos_valor_medio_estoque_${mes.id}`] || 0
    );

    const giroEstoque =
      levantamentoMes[`${ano}_processos_valor_medio_estoque_${mes.id}`] || 0;
    const taxaGiro = receitaBrutaMes / (giroEstoque / 12) || 0;
    giro_estoque.data.push(Math.round(taxaGiro * 100) / 100 || 0);

    inovacao.data.push(
      levantamentoMes[`${ano}_inovacao_total_implementado_${mes.id}`] || 0
    );
    faturamento_inovacao.data.push(
      levantamentoMes[`${ano}_inovacao_faturamento_${mes.id}`] || 0
    );

    nivel_absenteismo.data.push(
      levantamentoMes[`${ano}_indicadores_absenteismo_${mes.id}`] || 0
    );
    rotatividade.data.push(
      levantamentoMes[`${ano}_indicadores_rotatividade_${mes.id}`] || 0
    );
    funcionarios_antigos.data.push(
      levantamentoMes[`${ano}_indicadores_funcionarios_${mes.id}`] || 0
    );

    const mesAvaliaRelacionamento = mesesAvaliamRelacionamento.find(
      (element) => element === mes.pos
    );
    if (mesAvaliaRelacionamento) {
      const nivelRelacionamentoMes = FuncoesDeQuestionario.calculaPontuacaoQuiz(
        questionarioRelacionamento,
        levantamentoMes,
        `${ano}_`,
        `_${mes.id}`
      );
      nivel_relacionamento.data.push(nivelRelacionamentoMes);
    }

    const mesAvaliaCompetencias = mesesAvaliamCompetencias.find(
      (element) => element === mes.pos
    );
    if (mesAvaliaCompetencias) {
      const nivelCompetenciasMes = FuncoesDeQuestionario.calculaPontuacaoQuiz(
        questionarioCompetencias,
        levantamentoMes,
        `${ano}_`,
        `_${mes.id}`
      );
      competencias_adquiridas.data.push(nivelCompetenciasMes);
    }

    const mesAvaliaEngajamento = mesesAvaliamEngajamento.find(
      (element) => element === mes.pos
    );
    if (mesAvaliaEngajamento) {
      const nivelEngajamentoMes = FuncoesDeQuestionario.calculaPontuacaoQuiz(
        questionarioEngajamento,
        levantamentoMes,
        `${ano}_`,
        `_${mes.id}`
      );
      engajamento.data.push(nivelEngajamentoMes);
    }

    const mesAvaliaRetencao = mesesAvaliamRetencao.find(
      (element) => element === mes.pos
    );
    if (mesAvaliaRetencao) {
      const nivelRetencaoMes = FuncoesDeQuestionario.calculaPontuacaoQuiz(
        questionarioRetencao,
        levantamentoMes,
        `${ano}_`,
        `_${mes.id}`
      );
      retencao.data.push(nivelRetencaoMes);
    }
  });

  const metaReceitaBrutaMes = metaReceita ? metaReceita.meta / 12 : 0;
  const metaRentabilidadeMes = metaRentabilidade
    ? metaRentabilidade.rentabilidade_percentage
    : 0;
  const metaEbitdaMes = metaRentabilidade
    ? metaRentabilidade.ebitda_percentage
    : 0;
  const metaCustosMes = metaReceita
    ? parseFloat(metaReceita.despesas.custo_dos_produtos_industrializados) / 12
    : 0;
  const metaDespesasMes = metaReceita
    ? metaReceita.despesas.despesas_total / 12
    : 0;

  let metaEndividamentoMes = metaEndividamento
    ? metaEndividamento.endividamento_anterior *
      (1 - metaEndividamento.meta_reducao_divida / 100)
    : 0;
  if (metaEndividamentoMes > 0) {
    let mesNew = metaEndividamento.endividamento_anterior;
    const diff =
      metaEndividamento.endividamento_anterior - metaEndividamentoMes;
    const diffMes = Math.round((diff / 12) * 100) / 100;
    const metaEndividamentoMesReduzida = meses.map(() => {
      const metaMes = Math.round((mesNew - diffMes) * 100) / 100;
      mesNew = metaMes;
      return metaMes;
    });
    metaEndividamentoMesReduzida[11] = metaEndividamentoMes;
    metaEndividamentoMes = metaEndividamentoMesReduzida;
  } else {
    metaEndividamentoMes = meses.map(() => 0);
  }

  const metaInadimplencia = metaEndividamento
    ? metaEndividamento.meta_reducao_inadimplencia
    : 0;
  const metaClientesNovos = metaMarketing
    ? metaMarketing.clientes_novos_previsto / 12
    : 0;
  const metaEntregaFuncionario = metaProdutividade
    ? metaProdutividade.quantidade_entregue_funcionarios_previsto / 12
    : 0;
  const metaInovacaoMes = metaInovacao
    ? metaInovacao.inovacao_previsao / 12
    : 0;
  const metaClientesPerdidos = metaMarketing
    ? metaMarketing.clientes_perdidos_previsto / 12
    : 0;

  let despesasPessoal = 0;
  if (metaReceita) {
    despesasPessoal =
      parseFloat(metaReceita.despesas.despesas_com_pessoal) / 12;
  }
  const metaReceitaCusto = metaReceita
    ? metaReceitaBrutaMes / despesasPessoal
    : 0;

  const metaRelacionamentoMes = FuncoesDeQuestionario.calculaPontuacaoQuiz(
    questionarioRelacionamento,
    metaRelacionamento
  );
  const metaCompetenciasMes = FuncoesDeQuestionario.calculaPontuacaoQuiz(
    questionarioCompetencias,
    metaCompetencias
  );
  const metaEngajamentoMes = FuncoesDeQuestionario.calculaPontuacaoQuiz(
    questionarioEngajamento,
    metaEngajamento
  );
  const metaRetencaoMes = FuncoesDeQuestionario.calculaPontuacaoQuiz(
    questionarioRetencao,
    metaRetencao
  );

  response[0].data.receita_bruta = [
    {
      label: "Meta",
      data: meses.map(() => Math.round(metaReceitaBrutaMes * 100) / 100),
    },
    receitaBruta,
    {
      ...tipoReal,
      validation: "total",
      definition: "max",
    },
  ];
  response[0].data.rentabilidade = [
    {
      label: "Meta",
      data: meses.map(() => Math.round(metaRentabilidadeMes * 100) / 100),
    },
    rentabilidade,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "max",
    },
  ];
  response[0].data.ebitda = [
    {
      label: "Meta",
      data: meses.map(() => Math.round(metaEbitdaMes * 100) / 100),
    },
    ebitda,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "min",
    },
  ];
  response[0].data.custos_mercadorias = [
    {
      label: "Meta",
      data: meses.map(
        () =>
          Math.round((100 / metaReceitaBrutaMes) * metaCustosMes * 100) / 100 ||
          0
      ),
    },
    custosMercadorias,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "min",
    },
  ];
  response[0].data.despesas = [
    {
      label: "Meta",
      data: meses.map(
        () =>
          Math.round((100 / metaReceitaBrutaMes) * metaDespesasMes * 100) /
            100 || 0
      ),
    },
    despesas,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "min",
    },
  ];
  response[0].data.endividamento = [
    {
      label: "Meta",
      data: metaEndividamentoMes,
    },
    endividamento,
    {
      ...tipoReal,
      validation: "min_value",
      definition: "min",
    },
  ];
  response[0].data.inadimplencia = [
    {
      label: "Meta",
      data: meses.map(() => metaInadimplencia),
    },
    inadimplencia,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "min",
    },
  ];

  response[1].data.clientes_ativos = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaMarketing
          ? Math.round((metaMarketing.clientes_ativos_previsto * 100) / 100) ||
            0
          : 0
      ),
    },
    clientes_ativos,
    {
      ...tipoInteger,
      validation: "max_value",
      definition: "max",
    },
  ];
  response[1].data.novos_clientes = [
    {
      label: "Meta",
      data: meses.map(() => Math.round(metaClientesNovos * 100) / 100),
    },
    novos_clientes,
    {
      ...tipoInteger,
      validation: "total",
      definition: "max",
    },
  ];
  response[1].data.taxa_conversao = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaVendas ? metaVendas.meta_taxa_conversao_prevista || 0 : 0
      ),
    },
    taxa_conversao,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "max",
    },
  ];
  response[1].data.ticket_medio = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaMarketing
          ? Math.round(metaMarketing.ticket_medio_previsto * 100) / 100 || 0
          : 0
      ),
    },
    ticket_medio,
    {
      ...tipoReal,
      validation: "average",
      definition: "max",
    },
  ];
  response[1].data.clientes_fidelizados = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaRelacionamento
          ? Math.round(
              (metaRelacionamento.meta_clientes_fidelizados_previsto * 100) /
                100
            ) || 0
          : 0
      ),
    },
    clientes_fidelizados,
    {
      ...tipoInteger,
      validation: "max_value",
      definition: "max",
    },
  ];
  response[1].data.nivel_relacionamento = [
    {
      label: "Meta",
      data: mesesAvaliamRelacionamento.map(() => metaRelacionamentoMes),
    },
    nivel_relacionamento,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "max",
    },
  ];
  response[1].data.reclamacoes_recebidas = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaSatisfacao ? metaSatisfacao.meta_reclamacao_nf_previsto || 0 : 0
      ),
    },
    reclamacoes_recebidas,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "min",
    },
  ];
  response[1].data.clientes_perdidos = [
    {
      label: "Meta",
      data: meses.map(
        () => Math.round((metaClientesPerdidos * 100) / 100) || 0
      ),
    },
    clientes_perdidos,
    {
      ...tipoInteger,
      validation: "total",
      definition: "min",
    },
  ];

  response[2].data.receita_custo = [
    {
      label: "Meta",
      data: meses.map(() => Math.round(metaReceitaCusto * 100) / 100),
    },
    receita_custo,
    {
      ...tipoReal,
      validation: "average",
      definition: "max",
    },
  ];
  response[2].data.entrega_funcionario = [
    {
      label: "Meta",
      data: meses.map(() => Math.round(metaEntregaFuncionario * 100) / 100),
    },
    entrega_funcionario,
    {
      ...tipoFloat,
      validation: "average",
      definition: "max",
    },
  ];
  response[2].data.refugo_retrabalho = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaQualidade ? metaQualidade.refugo_retrabalho_previsao || 0 : 0
      ),
    },
    refugo_retrabalho,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "min",
    },
  ];
  response[2].data.custos_garantia = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaQualidade ? metaQualidade.custos_garantia_previsao || 0 : 0
      ),
    },
    custos_garantia,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "min",
    },
  ];
  response[2].data.capacidade_produtiva = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaEficiencia ? metaEficiencia.capacidade_produtiva_previsao || 0 : 0
      ),
    },
    capacidade_produtiva,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "min",
    },
  ];
  response[2].data.eficiencia_operacional = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaEficiencia ? metaEficiencia.eficiencia_previsao || 0 : 0
      ),
    },
    eficiencia_operacional,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "max",
    },
  ];
  response[2].data.entregas_prazo = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaLogistica ? metaLogistica.entrega_prazo_previsao || 0 : 0
      ),
    },
    entregas_prazo,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "max",
    },
  ];
  response[2].data.valor_estoque = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaLogistica ? metaLogistica.valor_estoque_previsao || 0 : 0
      ),
    },
    valor_estoque,
    {
      ...tipoReal,
      validation: "max_value",
      definition: "min",
    },
  ];
  response[2].data.giro_estoque = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaLogistica ? metaLogistica.giro_estoque_previsao || 0 : 0
      ),
    },
    giro_estoque,
    {
      ...tipoFloat,
      validation: "average",
      definition: "max",
    },
  ];

  response[3].data.competencias_adquiridas = [
    {
      label: "Meta",
      data: mesesAvaliamCompetencias.map(() => metaCompetenciasMes),
    },
    competencias_adquiridas,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "max",
    },
  ];
  response[3].data.nivel_absenteismo = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaEngajamento ? metaEngajamento.absenteismo_meta || 0 : 0
      ),
    },
    nivel_absenteismo,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "min",
    },
  ];
  response[3].data.engajamento = [
    {
      label: "Meta",
      data: mesesAvaliamEngajamento.map(() => metaEngajamentoMes),
    },
    engajamento,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "max",
    },
  ];
  response[3].data.rotatividade = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaRetencao ? metaRetencao.rotatividade_meta || 0 : 0
      ),
    },
    rotatividade,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "min",
    },
  ];
  response[3].data.funcionarios_antigos = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaRetencao ? metaRetencao.funcionarios_antigos_meta || 0 : 0
      ),
    },
    funcionarios_antigos,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "max",
    },
  ];
  response[3].data.retencao = [
    {
      label: "Meta",
      data: mesesAvaliamRetencao.map(() => metaRetencaoMes),
    },
    retencao,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "max",
    },
  ];
  response[3].data.inovacao = [
    {
      label: "Meta",
      data: meses.map(() => metaInovacaoMes),
    },
    inovacao,
    {
      ...tipoInteger,
      validation: "total",
      definition: "max",
    },
  ];
  response[3].data.faturamento_inovacao = [
    {
      label: "Meta",
      data: meses.map(() =>
        metaInovacao ? metaInovacao.faturamento_gasto_inovacao_meta || 0 : 0
      ),
    },
    faturamento_inovacao,
    {
      ...tipoPercentage,
      validation: "average",
      definition: "max",
    },
  ];

  return response;
};

const getDashboardMetasPersonalizadas = async (dashboard, companyId, ano) => {
  await Promise.all(
    dashboard.map(async (perspectiva) => {
      const keys = Object.entries(perspectiva.data);

      const run = async (item) => {
        const [key, value] = item;
        value[0].data = await FuncoesDeEficacia.validaMetaPersonalizada(
          companyId,
          key,
          ano,
          value[0].data
        );
      };

      await Promise.all(keys.map(run));
    })
  );

  return dashboard;
};

const getGauge = async (companyId, ano) => {
  let dreMesesOk = 0;
  let dadosMesesOk = 0;
  let mesesCheck = 0;

  await Promise.all(
    meses.map(async (month) => {
      if (!month.checked) {
        mesesCheck += 1;
        const drePromise = FuncoesDeEficacia.getDreMensal(
          companyId,
          ano,
          month.id
        );
        const levantamentoPromise = FuncoesDeEficacia.getLevantamento(
          companyId,
          ano,
          month.id
        );

        const [dre, levantamento] = await Promise.all([
          drePromise,
          levantamentoPromise,
        ]);

        if (dre[`${ano}_persist_${month.id}`] === true) dreMesesOk += 1;
        if (Object.keys(levantamento).length > 0) dadosMesesOk += 1;
      }
    })
  );

  return {
    dre: (100 / mesesCheck) * dreMesesOk,
    levantamento: (100 / mesesCheck) * dadosMesesOk,
  };
};

const getDataMeta = async (company, ano, resource) => {
  let originalMetaResponse = null;
  let validationResponse = null;

  let dashboard = await getDashboardDefault(company, ano);
  dashboard = await getDashboardMetasPersonalizadas(dashboard, company.id, ano);

  dashboard.forEach((item) => {
    const keys = Object.entries(item.data);
    keys.forEach(([key, data]) => {
      if (key === resource) {
        originalMetaResponse = data[0].data;
        validationResponse = data[2].validation;
      }
    });
  });

  return {
    originalMeta: originalMetaResponse,
    validation: validationResponse,
  };
};

module.exports.gauges = async (event, action) => {
  const { companyId, company } = action;

  const anos = await company.getExercises();
  const gauges = {};

  await Promise.all(
    anos.map(async (ano) => {
      gauges[ano] = await getGauge(companyId, ano);
    })
  );

  return Handler.Ok({
    gauges,
  });
};

module.exports.carregarDreMensal = async (event, action) => {
  const { company, companyId } = action;
  const anos = await company.getExercises();
  const dre = {};

  await Promise.all(
    anos.map(async (ano) => {
      const dreYear = await FuncoesDeEficacia.getDreMensal(companyId, ano);
      if (Object.keys(dreYear).length > 0)
        dre[ano] = await parseDre(dreYear, ano, company);
    })
  );

  return Handler.Ok({
    dre,
    meses,
  });
};

module.exports.salvarDreMensal = async (event, action) => {
  const { companyId } = action;
  const { dre, year, month } = JSON.parse(event.body);

  if (!dre || !year || !month) {
    return Handler.BadRequest({
      analise: 'Campos obrigatórios para envio: "dre", "year", "month"',
    });
  }

  if (typeof month !== "object") {
    return Handler.BadRequest({
      analise:
        'O campo "month" deve ser um objeto contendo o id do mês referência.',
    });
  }

  const statusSave = await FuncoesDeEficacia.saveDre(
    companyId,
    dre,
    year,
    month
  );

  if (statusSave) {
    return Handler.Ok({
      message: `O DRE de ${month.title} / ${year} foi atualizado com sucesso :)`,
    });
  }

  return Handler.Error({
    message:
      "Ocorreu um erro ao salvar os dados. Caso o problema persista, nos chame no chat :)",
  });
};

module.exports.carregarLevantamentoMensal = async (event, action) => {
  const { companyId, company } = action;
  const anos = await company.getExercises();
  const levantamento = {};

  await Promise.all(
    anos.map(async (ano) => {
      levantamento[ano] = await parseLevantamento(
        await FuncoesDeEficacia.getLevantamento(companyId, ano),
        ano
      );
    })
  );

  return Handler.Ok({
    levantamento,
    meses,
  });
};

module.exports.salvarLevantamentoMensal = async (event, action) => {
  const { companyId } = action;
  const { levantamento, year, month } = JSON.parse(event.body);

  if (!levantamento || !year || !month) {
    return Handler.BadRequest({
      analise:
        'Campos obrigatórios para envio: "levantamento", "year", "month"',
    });
  }

  if (typeof month !== "object") {
    return Handler.BadRequest({
      analise:
        'O campo "month" deve ser um objeto contendo o id do mês referência.',
    });
  }

  const statusSave = await FuncoesDeEficacia.saveLevantamento(
    companyId,
    levantamento,
    year,
    month
  );

  if (statusSave) {
    return Handler.Ok({
      message: `O Levantamento de ${month.title} / ${year} foi atualizado com sucesso :)`,
    });
  }

  return Handler.Error({
    message:
      "Ocorreu um erro ao salvar os dados. Caso o problema persista, nos chame no chat :)",
  });
};

module.exports.exportDashboard = async (event, action) => {
  const { companyId, company } = action;
  const anos = await company.getExercises();
  // const anos = [2022];
  const dashboard = {};

  await Promise.all(
    anos.map(async (ano) => {
      const dashboardYear = await getDashboardDefault(company, ano);
      dashboard[ano] = await getDashboardMetasPersonalizadas(
        dashboardYear,
        companyId,
        ano
      );
    })
  );

  return Handler.Ok({
    dashboard,
    meses,
  });
};

module.exports.saveMetaDashboard = async (event, action) => {
  const { companyId, company } = action;
  const { ano, meta_resource, meta_data } = JSON.parse(event.body);

  if (!ano || !meta_resource || !meta_data) {
    return Handler.BadRequest({
      message:
        'Campos obrigatórios para envio: "ano", "meta_resource", "meta_data"',
    });
  }

  if (!Array.isArray(meta_data)) {
    return Handler.BadRequest({
      message:
        'O campo "meta_data" deve ser um array contendo os valores de cada ' +
        "mês iniciando na posição 0.",
    });
  }

  if (meta_data.length !== 12) {
    return Handler.BadRequest({
      message:
        'O campo "meta_data" deve ser um array contendo 12 itens, sendo um para cada mês.',
    });
  }

  const { originalMeta, validation } = await getDataMeta(
    company,
    ano,
    meta_resource
  );
  if (!originalMeta || !validation) {
    return Handler.Error({
      message: "Não foi possível localizar os dados originais da meta.",
    });
  }

  const instanceValid = new ValidaMeta(
    originalMeta,
    meta_data,
    meta_resource,
    validation
  );
  if (!instanceValid.isValid) {
    return Handler.Error({
      message: instanceValid.message,
    });
  }

  const statusSave = await FuncoesDeEficacia.saveMetaDashboard(
    companyId,
    ano,
    meta_resource,
    meta_data,
    meses
  );
  if (statusSave) {
    return Handler.Ok({
      message: "As metas foram atualizadas com sucesso :)",
    });
  }
  return Handler.Error({
    message:
      "Ocorreu um erro ao salvar os dados. Caso o problema persista, nos chame no chat :)",
  });
};

module.exports.gaugeDiretrizesPreenchimento = async (companyId, ano) => {
  const { dre, levantamento } = await getGauge(companyId, ano);
  return (dre + levantamento) / 2;
};

module.exports.gaugeDiretrizesEficacia = async (company, ano) => {
  const dashboardDefault = await getDashboardDefault(company, ano);
  const dashboard = await getDashboardMetasPersonalizadas(
    dashboardDefault,
    company.id,
    ano
  );

  let dentroDaMeta = 0;
  let foraDaMeta = 0;

  const monthCurrent = new Date().getMonth();

  dashboard.forEach(async (perspectiva) => {
    const keys = Object.entries(perspectiva.data);

    await Promise.all(
      keys.map(async (key) => {
        const [, categoriaData] = key;

        const meta = categoriaData[0];
        const atual = categoriaData[1];
        const { validation } = categoriaData[2];
        const { definition } = categoriaData[2];

        let totalMeta = meta.data
          .slice(0, monthCurrent)
          .reduce((total, num) => total + num, 0);
        let totalAtual = atual.data
          .slice(0, monthCurrent)
          .reduce((total, num) => total + num, 0);

        if (validation === "average") {
          totalMeta /= monthCurrent;
          totalAtual /= monthCurrent;
        }

        if (definition === "max") {
          if (totalAtual > totalMeta) {
            dentroDaMeta += 1;
          } else {
            foraDaMeta += 1;
          }
        } else if (totalAtual < totalMeta) {
          dentroDaMeta += 1;
        } else {
          foraDaMeta += 1;
        }
      })
    );
  });

  return (100 / (dentroDaMeta + foraDaMeta)) * dentroDaMeta;
};

module.exports.findMetaDefault = async (event, action) => {
  const { company } = action;
  const anos = await company.getExercises();
  const dashboard = {};

  await Promise.all(
    anos.map(async (ano) => {
      dashboard[ano] = await getDashboardDefault(company, ano);
    })
  );

  return Handler.Ok({
    status: "success",
    message:
      "Meta niveladas de acordo com os objetivos definidos no módulo anterior",
    dashboard,
    meses,
  });
};
