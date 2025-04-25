'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Eficiencia = sequelize.define('Objetivo_Eficiencia', {
    processoId: DataTypes.INTEGER,
    EmpresaId: DataTypes.STRING,
    tipo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    capacidade_produtiva_meta: DataTypes.FLOAT,
    capacidade_produtiva_previsao: DataTypes.FLOAT,
    eficiencia_meta: DataTypes.FLOAT,
    eficiencia_previsao: DataTypes.FLOAT,
  }, {});
  Objetivo_Eficiencia.associate = function(models) {
    // associations can be defined here
  };
  return Objetivo_Eficiencia;
};