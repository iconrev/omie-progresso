'use strict';
module.exports = (sequelize, DataTypes) => {
  const Analise_Objetivo_Endividamento = sequelize.define('Analise_Objetivo_Endividamento', {
    DreId: DataTypes.INTEGER,
    smile_divida: DataTypes.STRING,
    smile_taxa_divida_lucro: DataTypes.STRING,
    smile_inadimplencia: DataTypes.STRING
  }, {});
  Analise_Objetivo_Endividamento.associate = function (models) {
    // associations can be defined here
  };
  return Analise_Objetivo_Endividamento;
};