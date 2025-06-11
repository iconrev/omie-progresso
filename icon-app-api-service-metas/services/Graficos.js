"use strict";

const Handler = require("./handler");
const AnoExercicioEmpresa = require('./generico/AnoExercicioEmpresa');
const userController = require('../auth/userController');

const calculaPercentual = (result) => {
  let percentual = 0.0

  let dados = result[0]
  let keys = Object.keys(dados).length

  for (let i = 0; i < keys; i++) {
    let keyName = Object.keys(dados)[i]
    let keyValue = dados[keyName]

    if (keyValue !== null) {
      percentual += (100 / keys)
    }
  }

  return percentual
}

const verificarFinanceiro = async (filterCompany) => {

  const response = {
    title: 'Financeiro',
    recurso: 'financeiro',
    percentual: 0.0,
  }

  const query = `
  SELECT
      Objetivo_Receitas.id as Receitas,
      Objetivo_Rentabilidade.id as Rentabilidade,
      Objetivo_Custos.id as Custos,
      Objetivo_Endividamento.id as Endividamento
  FROM
      Objetivo_Receitas
      LEFT JOIN Objetivo_Rentabilidade ON Objetivo_Receitas.dreId = Objetivo_Rentabilidade.dreId
      LEFT JOIN Objetivo_Custos ON Objetivo_Receitas.dreId = Objetivo_Custos.dreId
      LEFT JOIN Objetivo_Endividamento ON Objetivo_Receitas.dreId = Objetivo_Endividamento.dreId
      LEFT JOIN Dre on Objetivo_Receitas.dreId = Dre.id
  WHERE
      Objetivo_Receitas.EmpresaId = :companyId and Dre.ano_exercicio = :anoExercicio
  `;
  const result = await userController.raw_query(query, filterCompany);
  if (result && result.length > 0) {
    response['percentual'] = calculaPercentual(result)
  } else {
    console.info('não achou')
  }

  return response;
}

const verificarComercial = async (filterCompany) => {

  const response = {
    title: 'Comercial',
    recurso: 'comercial',
    percentual: 0.0,
  }

  const query = `
  SELECT
      Objetivo_Marketing.id as Marketing,
      Objetivo_Vendas.id as Vendas,
      Objetivo_Relacionamento.id as Relacionamento,
      Objetivo_Satisfacao_Cliente.id as Satisfacao
  FROM
      Objetivo_Marketing
      LEFT JOIN Objetivo_Vendas ON Objetivo_Marketing.vendasId = Objetivo_Vendas.vendasId
      LEFT JOIN Objetivo_Relacionamento ON Objetivo_Marketing.vendasId = Objetivo_Relacionamento.vendasId
      LEFT JOIN Objetivo_Satisfacao_Cliente ON Objetivo_Marketing.vendasId = Objetivo_Satisfacao_Cliente.vendasId
      LEFT JOIN Vendas on Objetivo_Marketing.vendasId = Vendas.id
  WHERE
      Objetivo_Marketing.EmpresaId = :companyId and Vendas.ano_exercicio = :anoExercicio
  `;
  const result = await userController.raw_query(query, filterCompany);
  if (result && result.length > 0) {
    response['percentual'] = calculaPercentual(result)
  } else {
    console.info('não achou')
  }
  return response
}

const verificarProcessos = async (filterCompany) => {

  const response = {
    title: 'Processos',
    recurso: 'processos',
    percentual: 0.0,
  }

  const query = `
  SELECT 
      Objetivo_Produtividade.id AS Produtividade,
      Objetivo_Eficiencia.id AS Eficiencia,
      Objetivo_Logistica.id AS Logistica,
      Objetivo_Qualidade.id AS Qualidade
  FROM
      Objetivo_Produtividade
      LEFT JOIN Objetivo_Eficiencia ON Objetivo_Produtividade.processoId = Objetivo_Eficiencia.processoId
      LEFT JOIN Objetivo_Logistica ON Objetivo_Produtividade.processoId = Objetivo_Logistica.processoId
      LEFT JOIN Objetivo_Qualidade ON Objetivo_Produtividade.processoId = Objetivo_Qualidade.processoId
      LEFT JOIN Processos on Objetivo_Produtividade.processoId = Processos.id
  WHERE
      Objetivo_Produtividade.EmpresaId = :companyId and Processos.ano_exercicio = :anoExercicio
  `;
  const result = await userController.raw_query(query, filterCompany);
  if (result && result.length > 0) {
    response['percentual'] = calculaPercentual(result)
  } else {
    console.info('não achou')
  }

  return response
}

const verificarPessoas = async (filterCompany) => {

  const response = {
    title: 'Pessoas',
    recurso: 'pessoas',
    percentual: 0.0,
  }

  const query = `
  SELECT 
      Objetivo_Competencia.id AS Objetivo_Competencia,
      Objetivo_Engajamento.id AS Objetivo_Engajamento,
      Objetivo_Retencao.id AS Objetivo_Retencao,
      Objetivo_Inovacao.id AS Objetivo_Inovacao
  FROM
      Objetivo_Competencia
      LEFT JOIN Objetivo_Engajamento ON Objetivo_Competencia.pessoasId = Objetivo_Engajamento.pessoasId
      LEFT JOIN Objetivo_Retencao ON Objetivo_Competencia.pessoasId = Objetivo_Retencao.pessoasId
      LEFT JOIN Objetivo_Inovacao ON Objetivo_Competencia.pessoasId = Objetivo_Inovacao.pessoasId
      LEFT JOIN Pessoas on Objetivo_Competencia.pessoasId = Pessoas.id
  WHERE
  Objetivo_Competencia.EmpresaId = :companyId and Pessoas.ano_exercicio = :anoExercicio
  `;

  const result = await userController.raw_query(query, filterCompany);
  if (result && result.length > 0) {
    response['percentual'] = calculaPercentual(result)
  } else {
    console.info('não achou')
  }

  return response;
}

module.exports.CarregarGraficos = async (event, action) => {

  console.info('carregar graficos de metas');

  const { companyId } = action;
  const anos = await AnoExercicioEmpresa.getAll(companyId);
  const analise = {};

  const promises = anos.map(async (ano) => {
    ano = parseInt(ano)
    const filterCompany = {
      companyId: companyId,
      anoExercicio: (ano - 1),
    }

    const perspectivasPromises = []
    perspectivasPromises.push(verificarFinanceiro(filterCompany))
    perspectivasPromises.push(verificarComercial(filterCompany))
    perspectivasPromises.push(verificarProcessos(filterCompany))
    perspectivasPromises.push(verificarPessoas(filterCompany))
    const perspectivas = await Promise.all(perspectivasPromises);

    const total = perspectivas.reduce((previousValue, currentValue) => previousValue + currentValue.percentual, 0);

    analise[ano] = {
      status: 'success',
      message: 'Gráficos encontrados :)',
      perspectivas: perspectivas,
      total: (total > 0) ? (total / 4) : 0,
    }
  })
  await Promise.all(promises);

  return Handler.Ok({
    analise: analise
  });

}