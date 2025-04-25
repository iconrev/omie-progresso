'use strict';

module.exports = (sequelize, DataTypes) => {
  const Swot_Forca_Fraqueza = sequelize.define('Swot_Forca_Fraqueza', {
    EmpresaId: DataTypes.STRING,
    ano_exercicio: DataTypes.STRING,
    status: DataTypes.STRING(1),
    swot_codigo: DataTypes.INTEGER
  }, {});
  Swot_Forca_Fraqueza.associate = function (models) {
    // associations can be defined here
  };
  return Swot_Forca_Fraqueza;
};