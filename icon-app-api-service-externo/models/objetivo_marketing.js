'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Marketing = sequelize.define('Objetivo_Marketing', {
    vendasId: DataTypes.INTEGER,
    EmpresaId: DataTypes.STRING,
    tipo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    ticket_medio_previsto: DataTypes.FLOAT,
    meta_ticket_medio: DataTypes.FLOAT,
    clientes_ativos_previsto: DataTypes.FLOAT,
    meta_clientes_ativos: DataTypes.FLOAT,
    clientes_perdidos_previsto: DataTypes.FLOAT,
    meta_clientes_perdidos: DataTypes.FLOAT,
    clientes_ativos_corrente: DataTypes.FLOAT,
    clientes_novos_previsto: DataTypes.FLOAT,
    base_clientes_previsto: DataTypes.FLOAT,
  }, {});
  Objetivo_Marketing.associate = function(models) {
    // associations can be defined here
  };
  return Objetivo_Marketing;
};