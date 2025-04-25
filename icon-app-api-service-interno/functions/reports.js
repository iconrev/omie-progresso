const AWS = require("aws-sdk");
const Handler = require("../services/handler");
const models = require("../models");

const {
  Vendas_Avaliacao,
  Processos_Avaliacao,
  Pessoas_Avaliacao
} = models;

const { Company } = require("../auth/CompanyService")
const { analise_desempenho_financeiro } = require("../services/diagnostico/interno/dre")
const { calcular_pontos } = require('../services/diagnostico/interno/Comercial')
const {
  calcularNivelCompetencia,
  calcularNivelEngajamento,
  calcularNivelRetencao
} = require("../services/diagnostico/interno/Pessoas")

const { updateEficienciaFinanceiro } = require("../services/diagnostico/interno/dre")
const { updateEficienciaComercial } = require("../services/diagnostico/interno/Comercial")
const { updateEficienciaProcessos } = require("../services/diagnostico/interno/Processos")
const { updateEficienciaPessoas } = require("../services/diagnostico/interno/Pessoas")

const updateEficienciaTypes = {
  "financeira": updateEficienciaFinanceiro,
  "comercial": updateEficienciaComercial,
  "processos": updateEficienciaProcessos,
  "pessoas": updateEficienciaPessoas,
}

const AnoExercicioEmpresa = require("../services/generico/AnoExercicioEmpresa");


const getFinaneiro = async (company, anos) => {

  const analise = {};

  const run = async (ano) => {
    const ano_analise = ano - 1;
    const dre = await company.getDreByYear(ano_analise);

    if (dre) {
      const result = await analise_desempenho_financeiro(company, dre);

      if (result.receita_bruta === 0 && result.lucro_liquido === 0) {
        analise[ano] = {
          status: "diagnostic_not_found",
          message: `Os dados do DRE de ${ano_analise} estão incompletos.`,
        };
      } else {
        analise[ano] = result;
        analise[ano].status = "success";
      }
    } else {
      analise[ano] = {
        status: "diagnostic_not_found",
        message: `Não há Análise de Desempenho Financeiro para o ano de ${ano}.`,
      };
    }
  };

  await Promise.all(anos.map((ano) => run(ano)));

  const logInfo = `Carregando avaliação do Ambiente Interno [financeiro]`;
  console.info(logInfo);

  return analise

}

const getComercial = async (companyId, company, anos) => {

  const analise = {};

  for (const ano of anos) {
    const ano_analise = ano - 1;
    const dre = await company.getDreByYear(ano_analise);

    if (!dre) {
      analise[ano] = {
        status: "dre_not_found",
        message: `DRE ${ano - 1} não preenchido.`,
      };
      continue;
    }

    const vendas = await company.getCommercialByYear(ano_analise);

    if (!vendas) {
      analise[ano] = {
        status: "diagnostic_not_found",
        message: `Não há Análise de Desempenho de Vendas para o ano de ${ano_analise}.`,
      };
      continue;
    }

    const ticket_medio = (dre.inputs.receita_bruta) / vendas.notas_fiscais_emitidas;
    const percentual_clientes_ativos = (vendas.carteira_de_clientes_ativa / vendas.base_clientes) * 100;
    const taxa_reclamacao_nf = (vendas.reclamacoes_clientes / vendas.notas_fiscais_emitidas) * 100;
    const taxa_conversao = (vendas.propostas_aprovadas_no_ano / vendas.propostas_enviadas_no_ano) * 100;
    const percentual_clientes_fidelizados = (vendas.clientes_fidelizados / vendas.carteira_de_clientes_ativa) * 100;

    const calculo_1 = calcular_pontos(vendas.processos_politica_relacionamento_cliente);
    const calculo_2 = calcular_pontos(vendas.canais_comunicacao_estruturado);
    const calculo_3 = calcular_pontos(vendas.equipe_treinada_para_relacionamento);
    const calculo_4 = calcular_pontos(vendas.execucao_plano_relacionamento);
    const calculo_5 = calcular_pontos(vendas.atuacao_demanda_identificadas);
    vendas.nivel_relacionamento_clientes = ((calculo_1 + calculo_2 + calculo_3 + calculo_4 + calculo_5) / 25) * 100;

    const avaliacao = await Vendas_Avaliacao.findOne({
      where: { EmpresaId: companyId, ano_exercicio: ano_analise },
      raw: true,
    });
    const avaliacaoResponse = avaliacao
      ? {
        smile_percentual_clientes_ativos:
          avaliacao.percentual_clientes_ativos || "NaoAvaliado",
        smile_novos_clientes_no_ano:
          avaliacao.novos_clientes_no_ano || "NaoAvaliado",
        smile_taxa_conversao: avaliacao.taxa_conversao || "NaoAvaliado",
        smile_ticket_medio: avaliacao.ticket_medio || "NaoAvaliado",
        smile_clientes_fidelizados:
          avaliacao.clientes_fidelizados || "NaoAvaliado",
        smile_nivel_relacionamento_clientes:
          avaliacao.nivel_relacionamento_clientes || "NaoAvaliado",
        smile_clientes_perdidos: avaliacao.clientes_perdidos || "NaoAvaliado",
        smile_taxa_reclamacao_nf:
          avaliacao.taxa_reclamacao_nf || "NaoAvaliado",
      }
      : {
        smile_percentual_clientes_ativos: "NaoAvaliado",
        smile_novos_clientes_no_ano: "NaoAvaliado",
        smile_taxa_conversao: "NaoAvaliado",
        smile_ticket_medio: "NaoAvaliado",
        smile_clientes_fidelizados: "NaoAvaliado",
        smile_nivel_relacionamento_clientes: "NaoAvaliado",
        smile_clientes_perdidos: "NaoAvaliado",
        smile_taxa_reclamacao_nf: "NaoAvaliado",
      };

    analise[ano] = {
      vendas,
      avaliacao: avaliacaoResponse,
      ticket_medio,
      percentual_clientes_ativos,
      taxa_reclamacao_nf,
      taxa_conversao,
      percentual_clientes_fidelizados,
      status: "success",
    };
  }

  const logInfo = `Carregando avaliação do Ambiente Interno [comercial]`;
  console.info(logInfo);

  return analise
}

const getProcesso = async (companyId, company, anos) => {

  const analise = {};

  for (const ano of anos) {
    const ano_analise = parseInt(ano) - 1;
    const dreYear = await company.getDreByYear(ano_analise);

    if (!dreYear) {
      analise[ano] = {
        status: "dre_not_found",
        message: `DRE ${ano - 1} não preenchido.`,
      };
      continue;
    }

    const processo = await company.getProcessesByYear(ano_analise);

    if (!processo) {
      analise[ano] = {
        status: "diagnostic_not_found",
        message: `Não há Análise de Desempenho de Processos para o ano de ${ano_analise}.`,
      };
      continue;
    }

    const dre = dreYear.inputs;
    dreYear.despesas.forEach((despesa) => {
      dre[despesa.field] = despesa.value;
    });

    const custo_mercadorias_vendidas =
      dre.custo_dos_produtos_industrializados || 0;
    const percentual_capacidade_produtiva =
      processo.volume_produzido_no_ano > 0 && processo.capacidade_produzida > 0
        ? (processo.volume_produzido_no_ano / processo.capacidade_produzida) *
        100
        : 0;
    const quantidade_entregue_funcionarios =
      processo.volume_produzido_no_ano > 0 && processo.funcionarios > 0
        ? processo.volume_produzido_no_ano / processo.funcionarios
        : 0;
    const custos_garantia =
      processo.custos_garantia > 0
        ? (100 / dre.receita_bruta) * processo.custos_garantia
        : 0;
    const quantidade_giro_estoque =
      dre.receita_bruta > 0 && processo.valor_do_estoque > 0
        ? dre.receita_bruta / processo.valor_do_estoque
        : 0;
    const produtividade =
      dre.despesas_com_pessoal > 0
        ? dre.receita_bruta / dre.despesas_com_pessoal
        : 0;
    processo.percentual_disponibilidade_equipamento =
      100 - processo.percentual_disponibilidade_equipamento;

    const avaliacao = await Processos_Avaliacao.findOne({
      where: { EmpresaId: companyId, ano_exercicio: ano_analise },
      raw: true,
    });
    const avaliacaoResponse = avaliacao
      ? {
        smile_faturamento_custo_folha:
          avaliacao.faturamento_custo_folha || "NaoAvaliado",
        smile_quantidade_entregue_funcionarios:
          avaliacao.quantidade_entregue_funcionarios || "NaoAvaliado",
        smile_refugo_retrabalho: avaliacao.refugo_retrabalho || "NaoAvaliado",
        smile_custos_garantia: avaliacao.custos_garantia || "NaoAvaliado",
        smile_clientes_fidelizados:
          avaliacao.clientes_fidelizados || "NaoAvaliado",
        smile_percentual_capacidade_produtiva:
          avaliacao.percentual_capacidade_produtiva || "NaoAvaliado",
        smile_percentual_disponibilidade_equipamento:
          avaliacao.percentual_disponibilidade_equipamento || "NaoAvaliado",
        smile_entregas_no_prazo: avaliacao.entregas_no_prazo || "NaoAvaliado",
        smile_quantidade_giro_estoque:
          avaliacao.quantidade_giro_estoque || "NaoAvaliado",
        smile_valor_do_estoque: avaliacao.valor_do_estoque || "NaoAvaliado",
      }
      : {
        smile_faturamento_custo_folha: "NaoAvaliado",
        smile_quantidade_entregue_funcionarios: "NaoAvaliado",
        smile_refugo_retrabalho: "NaoAvaliado",
        smile_custos_garantia: "NaoAvaliado",
        smile_percentual_capacidade_produtiva: "NaoAvaliado",
        smile_percentual_disponibilidade_equipamento: "NaoAvaliado",
        smile_entregas_no_prazo: "NaoAvaliado",
        smile_quantidade_giro_estoque: "NaoAvaliado",
        smile_valor_do_estoque: "NaoAvaliado",
      };

    const receita_bruta_custo_folha =
      dre.receita_bruta / dre.despesas_com_pessoal || 0;
    const capacidade_produtiva =
      (processo.volume_produzido_no_ano / processo.capacidade_produzida) *
      100 || 0;
    const eficiencia_operacional =
      processo.percentual_disponibilidade_equipamento;

    analise[ano] = {
      processos: processo,
      avaliacao: avaliacaoResponse,
      percentual_capacidade_produtiva,
      quantidade_entregue_funcionarios,
      produtividade,
      custos_garantia,
      quantidade_giro_estoque,
      capacidade_produtiva,
      eficiencia_operacional,
      faturamento_custo_folha: produtividade,
      receita_bruta: dre.receita_bruta,
      receita_bruta_custo_folha,
      status: "success",
    };
  }
  const logInfo = `Carregando avaliação do Ambiente Interno [processos]`;
  console.info(logInfo);

  return analise
};

const getPessoas = async (company, anos) => {

  const analise = {};

  for (const ano of anos) {
    const ano_analise = parseInt(ano, 10) - 1;

    const pessoas = await company.getPeopleByYear(ano_analise);

    if (!pessoas) {
      analise[ano] = {
        status: "diagnostic_not_found",
        message: `Não há Análise de Desempenho de Pessoas para o ano de ${ano_analise}.`,
      };
      continue;
    }

    // calcular pontos de compentência
    const op = calcularNivelCompetencia(pessoas.competencia_operacao);
    const adm = calcularNivelCompetencia(pessoas.competencia_adm);
    const ger = calcularNivelCompetencia(pessoas.competencia_gerenciais);
    const media_competencia = ((op + adm + ger) / 15) * 100;

    // calcular pontos de engajamento
    const rel = calcularNivelEngajamento(
      pessoas.engajamento_relacionamento_interpessoal
    );
    const mot = calcularNivelEngajamento(
      pessoas.engajamento_motivacao_comprometimento
    );
    const com = calcularNivelEngajamento(
      pessoas.engajamento_comunicacao_interna
    );
    const cli = calcularNivelEngajamento(
      pessoas.engajamento_clima_organizacional
    );
    const media_engajamento = ((rel + mot + com + cli) / 20) * 100;

    // calcular pontos de rentenção
    const pc = calcularNivelRetencao(pessoas.retencao_plano_carreira);
    const cs = calcularNivelRetencao(pessoas.retencao_cargo_salario);
    const ra = calcularNivelRetencao(pessoas.retencao_avaliacao_desempenho);
    const rp = calcularNivelRetencao(pessoas.retencao_reconhecimento_pessoas);
    const rr = calcularNivelRetencao(pessoas.retencao_recompensa);
    const media_retencao = ((pc + cs + ra + rp + rr) / 25) * 100;

    const data = {
      pessoas,
      nivel_competencia: media_competencia,
      nivel_engajamento: media_engajamento,
      nivel_retencao: media_retencao,
    };

    const filter = {
      where: { EmpresaId: company.id, ano_exercicio: ano_analise },
      raw: true,
    };
    const [avaliacao, vendas] = await Promise.all([
      Pessoas_Avaliacao.findOne(filter),
      Vendas_Avaliacao.findOne(filter),
    ]);

    const avaliacaoResponse = {
      smile_nivel_competencia: avaliacao
        ? avaliacao.nivel_competencia || "NaoAvaliado"
        : "NaoAvaliado",
      smile_absenteismo: avaliacao
        ? avaliacao.absenteismo || "NaoAvaliado"
        : "NaoAvaliado",
      smile_nivel_engajamento: avaliacao
        ? avaliacao.nivel_engajamento || "NaoAvaliado"
        : "NaoAvaliado",
      smile_rotatividade: avaliacao
        ? avaliacao.rotatividade || "NaoAvaliado"
        : "NaoAvaliado",
      smile_funcionarios_antigos: avaliacao
        ? avaliacao.funcionarios_antigos || "NaoAvaliado"
        : "NaoAvaliado",
      smile_nivel_retencao: avaliacao
        ? avaliacao.nivel_retencao || "NaoAvaliado"
        : "NaoAvaliado",
      smile_total_inovacao_implementada_empresa: avaliacao
        ? avaliacao.total_inovacao_implementada_empresa || "NaoAvaliado"
        : "NaoAvaliado",
      smile_faturamento_oriundo_inovacao: avaliacao
        ? avaliacao.faturamento_oriundo_inovacao || "NaoAvaliado"
        : "NaoAvaliado",
    };

    analise[ano] = {
      ...data,
      avaliacao: avaliacaoResponse,
      comercial: vendas,
      status: "success",
    };
  }

  const logInfo = `Carregando avaliação do Ambiente Interno [pessoas]`;
  console.info(logInfo);

  return analise
}

const gauge = async (companyDict, sourceGauge) => {

  const getCompanyObj = ["processos", "pessoas"]

  let company;
  let anos;

  if (getCompanyObj.includes(sourceGauge)) {
    company = companyDict["companyObj"]
    anos = await company.getExercises();
  } else {
    company = companyDict["companyId"]
    anos = await AnoExercicioEmpresa.getAll(company);
  }

  const avaliacao = {};

  const updateEficiencia = updateEficienciaTypes[sourceGauge]

  const promises = anos.map((ano) =>
    updateEficiencia(company, ano, avaliacao)
  );
  await Promise.all(promises);

  return avaliacao
};

const getReportData = async (companyId, year) => {

  const company = new Company(companyId)
  const anos = await company.getExercises();

  const companyDict = {
    companyObj: company,
    companyId: companyId
  }

  const analiseFinanceiroPromise = getFinaneiro(company, anos)
  const financeiroGaugePromise = gauge(companyDict, "financeira")

  const analiseComercialPromise = getComercial(companyId, company, anos)
  const comercialGaugePromise = gauge(companyDict, "comercial")

  const analiseProcessosPromise = getProcesso(companyId, company, anos)
  const processosGaugePromise = gauge(companyDict, "processos")

  const analisePessoasPromise = getPessoas(company, anos)
  const pessoasGaugePromise = gauge(companyDict, "pessoas")

  const [
    analiseFinanceiro,
    financeiroGauge,
    analiseComercial,
    comercialGauge,
    analiseProcessos,
    processosGauge,
    analisePessoas,
    pessoasGauge,
  ] = await Promise.all([
    analiseFinanceiroPromise,
    financeiroGaugePromise,
    analiseComercialPromise,
    comercialGaugePromise,
    analiseProcessosPromise,
    processosGaugePromise,
    analisePessoasPromise,
    pessoasGaugePromise
  ]);

  const percentual_total_despesas =
    analiseFinanceiro[year].receita_bruta > 0 && analiseFinanceiro[year].despesas_totais >= 0
      ? (analiseFinanceiro[year].despesas_totais / analiseFinanceiro[year].receita_bruta) * 100
      : 0;

  analiseFinanceiro[year].percentual_total_despesas = percentual_total_despesas

  analiseFinanceiro.media_gauge = financeiroGauge
  analiseComercial.media_gauge = comercialGauge
  analiseProcessos.media_gauge = processosGauge
  analisePessoas.media_gauge = pessoasGauge

  return {
    analiseFinanceiro,
    analiseComercial,
    analiseProcessos,
    analisePessoas
  };
};

exports.dispatcher = async (event, context, callback) => {
  console.info("==================");

  // Teste local
  if (event.body) {
    event = JSON.parse(event.body)
  }

  const records = event.Records;

  console.info("records", JSON.stringify(records));

  let response;

  for (let i = 0; i < records.length; i++) {
    console.info("================================");
    const message = JSON.parse(records[i].Sns.Message);
    console.info("message", JSON.stringify(message));

    const data = JSON.stringify(await getReportData(message.company_id, message.year))
    response = JSON.parse(data)

    const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: "sa-east-1" });

    const params = {
      TableName: process.env.TABLE_REPORTS_CALL,
      Key: {
        "company_id": message.company_id,
        "req_id": message.req_id
      }
    };

    const dyna_data = await dynamoDb.get(params).promise();

    const item = dyna_data.Item

    console.info(`Item recuperado do Dynamo -> ${JSON.stringify(item)}`);

    item.interno = response

    const reportData = {
      TableName: process.env.TABLE_REPORTS_CALL,
      Item: item,
    };

    try {
      await dynamoDb.put(reportData).promise();
      console.info(`Gravado no DynamoDB com sucesso data ${JSON.stringify(reportData)}`);
    } catch (e) {
      console.info("ReportData com Erro", JSON.stringify(reportData))
      console.error("Dynamo Erro ", e);
    }
  }

  return Handler.Ok(response);

};
