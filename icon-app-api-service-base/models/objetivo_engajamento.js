'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Engajamento = sequelize.define('Objetivo_Engajamento', {
    pessoasId: DataTypes.INTEGER,
    EmpresaId: DataTypes.STRING,
    tipo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    absenteismo_meta: DataTypes.FLOAT,
    meta_engajamento_relacionamento_interpessoal: DataTypes.STRING,
    meta_engajamento_motivacao_comprometimento: DataTypes.STRING,
    meta_engajamento_comunicacao_interna: DataTypes.STRING,
    meta_engajamento_clima_organizacional: DataTypes.STRING,
  }, {});
  Objetivo_Engajamento.associate = function(models) {
    // associations can be defined here
  };
  return Objetivo_Engajamento;
};