'use strict';

const {
  FLOAT
} = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Resumo_Interno = sequelize.define('Resumo_Interno', {
    EmpresaId: DataTypes.STRING,
    ano_exercicio: DataTypes.INTEGER,
    valor: DataTypes.FLOAT,
    financeiro: DataTypes.FLOAT,
    comercial: DataTypes.FLOAT,
    processos: DataTypes.FLOAT,
    pessoas: DataTypes.FLOAT,
  }, {});
  Resumo_Interno.associate = function (models) {
    // associations can be defined here
  };
  return Resumo_Interno;
};