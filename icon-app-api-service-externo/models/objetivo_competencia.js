'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Competencia = sequelize.define('Objetivo_Competencia', {
    pessoasId: DataTypes.INTEGER,
    EmpresaId: DataTypes.STRING,
    tipo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    meta_competencia_operacao: DataTypes.STRING,
    meta_competencia_adm: DataTypes.STRING,
    meta_competencia_gerenciais: DataTypes.STRING,
  }, {});
  Objetivo_Competencia.associate = function (models) {
    // associations can be defined here
  };
  return Objetivo_Competencia;
};