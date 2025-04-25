'use strict';
module.exports = (sequelize, DataTypes) => {
  const Diretrizes_Eficacia_Metas_Personalizadas = sequelize.define('Diretrizes_Eficacia_Metas_Personalizadas', {
    EmpresaId: DataTypes.STRING,
    campo: DataTypes.STRING,
    ano_exercicio: DataTypes.INTEGER,
    mes: DataTypes.STRING,
    valor: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: {
        isFloat: true
      }
    },
  }, {});
  Diretrizes_Eficacia_Metas_Personalizadas.associate = function (models) {
    // associations can be defined here
  };
  return Diretrizes_Eficacia_Metas_Personalizadas;
};