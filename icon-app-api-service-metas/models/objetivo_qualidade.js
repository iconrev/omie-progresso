'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Qualidade = sequelize.define('Objetivo_Qualidade', {
    processoId: DataTypes.INTEGER,
    EmpresaId: DataTypes.STRING,
    tipo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    custos_garantia_meta: DataTypes.FLOAT,
    custos_garantia_previsao: DataTypes.FLOAT,
    refugo_retrabalho_meta: DataTypes.FLOAT,
    refugo_retrabalho_previsao: DataTypes.FLOAT,
  }, {});
  Objetivo_Qualidade.associate = function(models) {
    // associations can be defined here
  };
  return Objetivo_Qualidade;
};