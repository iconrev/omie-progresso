'use strict';
const { returnModelValueEntityByArray } = require('./utils/returnValueDataModel')
const { Swot_Avaliacao_Client } = require('../core/models/analise_data')

module.exports = (sequelize, DataTypes) => {
  const Clientes = sequelize.define('Clientes', {
    cliente: DataTypes.STRING,
    preco: returnModelValueEntityByArray(DataTypes.STRING, 'preco', Swot_Avaliacao_Client),
    qualidade: returnModelValueEntityByArray(DataTypes.STRING, 'qualidade', Swot_Avaliacao_Client),
    entrega: returnModelValueEntityByArray(DataTypes.STRING, 'entrega', Swot_Avaliacao_Client),
    inovacao: returnModelValueEntityByArray(DataTypes.STRING, 'inovacao', Swot_Avaliacao_Client),
    portifolio: returnModelValueEntityByArray(DataTypes.STRING, 'portifolio', Swot_Avaliacao_Client),
    ano_exercicio: DataTypes.STRING,
    EmpresaId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { // Questionario_Swot belongsTo Company 1:1
        model: 'Empresas',
        key: 'id'
      }
    }
  }, {});
  Clientes.associate = function (models) {
  };
  return Clientes;
};