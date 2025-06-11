'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Produtividade = sequelize.define('Objetivo_Produtividade', {
    processoId: DataTypes.INTEGER,
    EmpresaId: DataTypes.STRING,
    tipo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    quantidade_entregue_funcionarios_meta: DataTypes.FLOAT,
    quantidade_entregue_funcionarios_previsto: DataTypes.FLOAT,
  }, {});
  Objetivo_Produtividade.associate = function(models) {
    // associations can be defined here
  };
  return Objetivo_Produtividade;
};