'use strict';
const { returnModelValueEntityByArray } = require('./utils/returnValueDataModel')
const { Swot_Avaliacao_Fornecedor } = require('../core/models/analise_data')

module.exports = (sequelize, DataTypes) => {
  const Fornecedores = sequelize.define('Fornecedores', {
    fornecedor: DataTypes.STRING,
    preco: returnModelValueEntityByArray(DataTypes.STRING, 'preco', Swot_Avaliacao_Fornecedor),
    qualidade: returnModelValueEntityByArray(DataTypes.STRING, 'qualidade', Swot_Avaliacao_Fornecedor),
    entrega: returnModelValueEntityByArray(DataTypes.STRING, 'entrega', Swot_Avaliacao_Fornecedor),
    inovacao: returnModelValueEntityByArray(DataTypes.STRING, 'inovacao', Swot_Avaliacao_Fornecedor),
    portifolio: returnModelValueEntityByArray(DataTypes.STRING, 'portifolio', Swot_Avaliacao_Fornecedor),
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
  Fornecedores.associate = function (models) {
  };
  return Fornecedores;
};