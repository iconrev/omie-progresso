'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Custo_Mensal_Fatores = sequelize.define('Objetivo_Custo_Mensal_Fatores', {
    jan: DataTypes.FLOAT,
    fev: DataTypes.FLOAT,
    mar: DataTypes.FLOAT,
    abr: DataTypes.FLOAT,
    mai: DataTypes.FLOAT,
    jun: DataTypes.FLOAT,
    jul: DataTypes.FLOAT,
    ago: DataTypes.FLOAT,
    set: DataTypes.FLOAT,
    out: DataTypes.FLOAT,
    nov: DataTypes.FLOAT,
    dez: DataTypes.FLOAT,
    EmpresaId: DataTypes.STRING,
    ano_exercicio: DataTypes.INTEGER
  }, {});
  Objetivo_Custo_Mensal_Fatores.associate = function(models) {
    // associations can be defined here
  };
  return Objetivo_Custo_Mensal_Fatores;
};