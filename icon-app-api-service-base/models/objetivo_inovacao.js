'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Inovacao = sequelize.define('Objetivo_Inovacao', {
    pessoasId: DataTypes.INTEGER,
    EmpresaId: DataTypes.STRING,
    tipo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    inovacao_meta: DataTypes.FLOAT,
    inovacao_previsao: DataTypes.FLOAT,
    faturamento_gasto_inovacao_meta: DataTypes.FLOAT,
    faturamento_gasto_inovacao_previsao: DataTypes.FLOAT,
  }, {});
  Objetivo_Inovacao.associate = function(models) {
    // associations can be defined here
  };
  return Objetivo_Inovacao;
};