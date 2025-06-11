const models = require("../../models");

const {
  Objetivo_Marketing,
  Objetivo_Vendas,
  Objetivo_Relacionamento,
  Objetivo_Satisfacao_Cliente,
  Objetivo_Receitas,
  Objetivo_Produtividade,
  Objetivo_Qualidade,
  Objetivo_Eficiencia,
  Objetivo_Logistica,
  Objetivo_Competencia,
  Objetivo_Engajamento,
  Objetivo_Retencao,
  Objetivo_Inovacao,
  Objetivo_Estrategias,
  Dre,
  Objetivo_Rentabilidade,
  Objetivo_Custos,
  Objetivo_Endividamento,
  Objetivo_Estrategias_Comercial,
  Vendas,
  Objetivo_Estrategias_Processos,
  Processos,
  Objetivo_Estrategias_Pessoas,
  Pessoas,
} = models;

const modelsCategory = {
  marketing: Objetivo_Marketing,
  vendas: Objetivo_Vendas,
  relacionamento: Objetivo_Relacionamento,
  satisfacao: Objetivo_Satisfacao_Cliente,
  receitas: Objetivo_Receitas,
  produtividade: Objetivo_Produtividade,
  qualidade: Objetivo_Qualidade,
  eficiencia: Objetivo_Eficiencia,
  logistica: Objetivo_Logistica,
  competencias: Objetivo_Competencia,
  engajamento: Objetivo_Engajamento,
  retencao: Objetivo_Retencao,
  inovacao: Objetivo_Inovacao,
};

const modelsFull = {
  Financeiro: {
    estrategias: Objetivo_Estrategias,
    foreignKey: {
      table: Dre,
      idName: "dre_id",
    },
    objetivos: {
      receitas: Objetivo_Receitas,
      rentabilidade: Objetivo_Rentabilidade,
      custos: Objetivo_Custos,
      endividamento: Objetivo_Endividamento,
    },
  },
  Comercial: {
    estrategias: Objetivo_Estrategias_Comercial,
    foreignKey: {
      table: Vendas,
      idName: "vendas_id",
    },
    objetivos: {
      marketing: Objetivo_Marketing,
      vendas: Objetivo_Vendas,
      relacionamento: Objetivo_Relacionamento,
      satisfacao: Objetivo_Satisfacao_Cliente,
    },
  },
  Processos: {
    estrategias: Objetivo_Estrategias_Processos,
    foreignKey: {
      table: Processos,
      idName: "processos_id",
    },
    objetivos: {
      produtividade: Objetivo_Produtividade,
      qualidade: Objetivo_Qualidade,
      eficiencia: Objetivo_Eficiencia,
      logistica: Objetivo_Logistica,
    },
  },
  Pessoas: {
    estrategias: Objetivo_Estrategias_Pessoas,
    foreignKey: {
      table: Pessoas,
      idName: "pessoas_id",
    },
    objetivos: {
      competencias: Objetivo_Competencia,
      engajamento: Objetivo_Engajamento,
      retencao: Objetivo_Retencao,
      inovacao: Objetivo_Inovacao,
    },
  },
};

exports.allCategory = () => modelsFull;

exports.byCategory = async (categoria) => modelsCategory[categoria];

exports.tableParent = async (companyId, ano_exercicio, model) => {
  let id;
  let message;
  let status = "fatal_error";

  const filterCategory = {
    where: {
      EmpresaId: companyId,
      ano_exercicio,
    },
  };

  await model
    .findOne(filterCategory)
    .then((result) => {
      if (result) {
        id = result.id;
        status = "success";
      } else {
        console.info("Nenhum cadastro de Vendas encontrado");
        status = "vendas_not_found";
        message = "Vendas não localizado";
      }
    })
    .catch((err) => {
      console.error("Erro ao buscar Vendas", err);
      message = "Erro ao buscar Vendas";
    });

  return {
    status,
    message,
    idParent: id,
  };
};
