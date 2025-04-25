'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Entrega = sequelize.define('Objetivo_Entrega', {
    ProcessoId: DataTypes.INTEGER,
    tipo: DataTypes.STRING,
    meta_entrega_prazo: DataTypes.FLOAT,
    meta_valor_estoque: DataTypes.FLOAT,
    EmpresId: DataTypes.STRING
  }, {});
  Objetivo_Entrega.associate = function (models) {
    // associations can be defined here
  };
  return Objetivo_Entrega;
};