'use strict';
module.exports = (sequelize, DataTypes) => {
  const Diretrizes_Eficacia_Dre = sequelize.define('Diretrizes_Eficacia_Dre', {
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
  }, {});
  Diretrizes_Eficacia_Dre.associate = function (models) {
    // associations can be defined here
  };
  return Diretrizes_Eficacia_Dre;
};