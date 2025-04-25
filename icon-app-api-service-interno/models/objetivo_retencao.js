'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Retencao = sequelize.define('Objetivo_Retencao', {
    pessoasId: DataTypes.INTEGER,
    EmpresaId: DataTypes.STRING,
    tipo: DataTypes.STRING,
    rotatividade_meta: DataTypes.FLOAT,
    funcionarios_antigos_meta: DataTypes.FLOAT,
    meta_retencao_plano_carreira: DataTypes.STRING,
    meta_retencao_cargo_salario: DataTypes.STRING,
    meta_retencao_avaliacao_desempenho: DataTypes.STRING,
    meta_retencao_reconhecimento_pessoas: DataTypes.STRING,
    meta_retencao_recompensa: DataTypes.STRING,
  }, {});
  Objetivo_Retencao.associate = function(models) {
    // associations can be defined here
  };
  return Objetivo_Retencao;
};