'use strict';
module.exports = (sequelize, DataTypes) => {
  const Diretrizes_Eficacia_Levantamento = sequelize.define('Diretrizes_Eficacia_Levantamento', {
    EmpresaId: DataTypes.STRING,
    ano_exercicio: DataTypes.INTEGER,
    mes: DataTypes.STRING,
    campo: DataTypes.STRING,
    valor: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        isFloat: true
      }
    },
    quiz: DataTypes.STRING,
  }, {});
  Diretrizes_Eficacia_Levantamento.associate = function (models) {
    // associations can be defined here
  };
  return Diretrizes_Eficacia_Levantamento;
};