'use strict';
module.exports = (sequelize, DataTypes) => {
  const Analise_Dre_Custos = sequelize.define('Analise_Dre_Custos', {
    DreId: DataTypes.INTEGER,
    percentual_custo_folha: DataTypes.STRING,
    percentual_custo_comercial: DataTypes.STRING,
    percentual_despesas_administrativas: DataTypes.STRING,
    percentual_despesas_logistica: DataTypes.STRING,
    percentual_despesas_ocupacao: DataTypes.STRING,
    percentual_despesas_servicos: DataTypes.STRING,
    percentual_despesas_tributaria: DataTypes.STRING,
    percentual_despesas_viagens: DataTypes.STRING,
    percentual_total_despesas: DataTypes.STRING,
    custo_das_mercadorias_vendidas: DataTypes.STRING
  }, {});
  Analise_Dre_Custos.associate = function (models) {
    // associations can be defined here
  };
  return Analise_Dre_Custos;
};