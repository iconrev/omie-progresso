'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Custo_Mensal = sequelize.define('Objetivo_Custo_Mensal', {
    EmpresaId: DataTypes.STRING(255),
    despesa: DataTypes.STRING(255),
    jan: DataTypes.DECIMAL(10,2),
    fev: DataTypes.DECIMAL(10,2),
    mar: DataTypes.DECIMAL(10,2),
    abr: DataTypes.DECIMAL(10,2),
    mai: DataTypes.DECIMAL(10,2),
    jun: DataTypes.DECIMAL(10,2),
    jul: DataTypes.DECIMAL(10,2),
    ago: DataTypes.DECIMAL(10,2),
    set: DataTypes.DECIMAL(10,2),
    out: DataTypes.DECIMAL(10,2),
    nov: DataTypes.DECIMAL(10,2),
    dez: DataTypes.DECIMAL(10,2),
    campo_:DataTypes.STRING,
    ano_exercicio:DataTypes.STRING,
    total:DataTypes.FLOAT,
  }, {});
  Objetivo_Custo_Mensal.associate = function (models) {
    // associations can be defined here
  };
  return Objetivo_Custo_Mensal;
};