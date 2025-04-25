'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Endividamento = sequelize.define('Objetivo_Endividamento', {
    dreId: DataTypes.INTEGER,
    EmpresaId: DataTypes.STRING,
    tipo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    meta_reducao_divida: DataTypes.FLOAT,
    meta_reducao_inadimplencia: DataTypes.FLOAT,
  }, {});
  Objetivo_Endividamento.associate = function (models) {
    // associations can be defined here
  };
  return Objetivo_Endividamento;
};