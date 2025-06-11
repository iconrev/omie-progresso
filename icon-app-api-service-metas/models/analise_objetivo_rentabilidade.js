'use strict';
module.exports = (sequelize, DataTypes) => {
  const Analise_Objetivo_Rentabilidade = sequelize.define('Analise_Objetivo_Rentabilidade', {
    DreId: DataTypes.INTEGER,
    smile_lucro_liquido: DataTypes.STRING,
    smile_rentabilidade_media: DataTypes.STRING,
    smile_rentabilidade_ultimo: DataTypes.STRING,
    smile_ebitda_medio: DataTypes.STRING,
    smile_ebitda_ultimo: DataTypes.STRING
  }, {});
  Analise_Objetivo_Rentabilidade.associate = function (models) {
    // associations can be defined here
  };
  return Analise_Objetivo_Rentabilidade;
};