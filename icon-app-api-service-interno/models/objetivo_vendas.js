'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Vendas = sequelize.define('Objetivo_Vendas', {
    vendasId: DataTypes.INTEGER,
    EmpresaId: DataTypes.STRING,
    tipo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    meta_taxa_conversao: DataTypes.FLOAT,
    meta_taxa_conversao_prevista: DataTypes.FLOAT,
  }, {});
  Objetivo_Vendas.associate = function(models) {
    // associations can be defined here
  };
  return Objetivo_Vendas;
};