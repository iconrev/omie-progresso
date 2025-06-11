'use strict';
module.exports = (sequelize, DataTypes) => {
  const Swot_Oportunidades = sequelize.define('Swot_Oportunidades', {
    descricao: DataTypes.STRING,
    pontos: DataTypes.INTEGER,
    ano_exercicio: DataTypes.STRING,
    origem: DataTypes.STRING,
    EmpresaId: DataTypes.STRING,
    valorId: DataTypes.INTEGER,                
  }, {});
  Swot_Oportunidades.associate = function (models) {
    // associations can be defined here
  };
  return Swot_Oportunidades;
};