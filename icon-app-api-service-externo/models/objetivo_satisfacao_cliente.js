'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Satisfacao_Cliente = sequelize.define('Objetivo_Satisfacao_Cliente', {
    vendasId: DataTypes.INTEGER,
    EmpresaId: DataTypes.STRING,
    tipo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    meta_reclamacao_nf: DataTypes.FLOAT,
    meta_reclamacao_nf_previsto: DataTypes.FLOAT,
  }, {});
  Objetivo_Satisfacao_Cliente.associate = function(models) {
    // associations can be defined here
  };
  return Objetivo_Satisfacao_Cliente;
};