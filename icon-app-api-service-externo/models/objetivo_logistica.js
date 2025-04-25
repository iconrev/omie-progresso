'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Logistica = sequelize.define('Objetivo_Logistica', {
    processoId: DataTypes.INTEGER,
    EmpresaId: DataTypes.STRING,
    tipo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    entrega_prazo_meta: DataTypes.FLOAT,
    entrega_prazo_previsao: DataTypes.FLOAT,
    giro_estoque_meta: DataTypes.FLOAT,
    giro_estoque_previsao: DataTypes.FLOAT,
    valor_estoque_meta: DataTypes.FLOAT,
    valor_estoque_previsao: DataTypes.FLOAT,
  }, {});
  Objetivo_Logistica.associate = function(models) {
    // associations can be defined here
  };
  return Objetivo_Logistica;
};