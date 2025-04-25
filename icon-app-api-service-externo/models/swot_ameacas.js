'use strict';
module.exports = (sequelize, DataTypes) => {
  const Swot_Ameacas = sequelize.define('Swot_Ameacas', {
    descricao: DataTypes.STRING,
    pontos: DataTypes.INTEGER,
    ano_exercicio: DataTypes.STRING,
    origem: DataTypes.STRING,
    EmpresaId: DataTypes.STRING,
    valorId: DataTypes.INTEGER
  }, {});
  Swot_Ameacas.associate = function (models) {
    // associations can be defined here
  };
  return Swot_Ameacas;
};