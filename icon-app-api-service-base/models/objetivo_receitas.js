'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Receitas = sequelize.define('Objetivo_Receitas', {
    dreId: DataTypes.INTEGER,
    percentage: DataTypes.FLOAT,
    tipo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    meta: DataTypes.FLOAT,
    EmpresaId: DataTypes.STRING
  }, {});
  Objetivo_Receitas.associate = function (models) {
    // associations can be defined here
  };
  return Objetivo_Receitas;
};