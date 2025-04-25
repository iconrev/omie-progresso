'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tabela_Swot_Interno = sequelize.define('Tabela_Swot_Interno', {
    EmpresaId: DataTypes.STRING,
    descricao: DataTypes.STRING,
    origem: DataTypes.STRING
  }, {});
  Tabela_Swot_Interno.associate = function(models) {
    // associations can be defined here
  };
  return Tabela_Swot_Interno;
};