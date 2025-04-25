'use strict';
module.exports = (sequelize, DataTypes) => {
  const DiagnosticoExternoAvaliacao = sequelize.define('DiagnosticoExternoAvaliacao', {
    EmpresaId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { // Questionario_Swot belongsTo Company 1:1
        model: 'Empresas',
        key: 'id'
      }
    },
    ano_exercicio: DataTypes.STRING,
    concorrentes: DataTypes.FLOAT,
    clientes: DataTypes.FLOAT,
    fornecedores: DataTypes.FLOAT,
    macro: DataTypes.FLOAT,
    media: DataTypes.FLOAT
  }, {});
  DiagnosticoExternoAvaliacao.associate = function (models) {
    // associations can be defined here
  };
  return DiagnosticoExternoAvaliacao;
};