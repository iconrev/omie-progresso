'use strict';
module.exports = (sequelize, DataTypes) => {
  const Analise_Objetivo_Receitas = sequelize.define('Analise_Objetivo_Receitas', {
    DreId: DataTypes.INTEGER,
    smile_receita_bruta: DataTypes.STRING,
    smile_crescimento_quatro: DataTypes.STRING,
    smile_crescimento: DataTypes.STRING
  }, {});
  Analise_Objetivo_Receitas.associate = function (models) {
    // associations can be defined here
  };
  return Analise_Objetivo_Receitas;
};