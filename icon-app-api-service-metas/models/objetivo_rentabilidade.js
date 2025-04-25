'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Rentabilidade = sequelize.define('Objetivo_Rentabilidade', {
    dreId: DataTypes.INTEGER,
    rentabilidade_percentage: DataTypes.FLOAT,
    ebitda_percentage: DataTypes.FLOAT,
    EmpresaId: DataTypes.STRING,
    tipo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    meta_rentabilidade: DataTypes.FLOAT,
    meta_lucro: DataTypes.FLOAT
  }, {});
  Objetivo_Rentabilidade.associate = function (models) {
    // associations can be defined here
  };
  return Objetivo_Rentabilidade;
};