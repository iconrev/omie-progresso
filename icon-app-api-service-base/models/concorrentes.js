'use strict';
const { returnModelValueEntityByArray } = require('./utils/returnValueDataModel')
const { Swot_Avaliacao } = require('../core/models/analise_data')

module.exports = (sequelize, DataTypes) => {
  const Concorrentes = sequelize.define('Concorrentes', {
    concorrente: DataTypes.STRING,
    preco: returnModelValueEntityByArray(DataTypes.STRING, 'preco', Swot_Avaliacao),
    qualidade: returnModelValueEntityByArray(DataTypes.STRING, 'qualidade', Swot_Avaliacao),
    entrega: returnModelValueEntityByArray(DataTypes.STRING, 'entrega', Swot_Avaliacao),
    inovacao: returnModelValueEntityByArray(DataTypes.STRING, 'inovacao', Swot_Avaliacao),
    portifolio: returnModelValueEntityByArray(DataTypes.STRING, 'portifolio', Swot_Avaliacao),
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
  Concorrentes.associate = function (models) {

  };
  return Concorrentes;
}