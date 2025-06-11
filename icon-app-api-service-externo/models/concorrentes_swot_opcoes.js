'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Concorrentes_Swot_Opcoes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Concorrentes_Swot_Opcoes.init({
    EmpresaId: DataTypes.STRING,
    descricao: DataTypes.STRING,
    index: DataTypes.INTEGER,
    tipo: DataTypes.STRING,
    origem: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Concorrentes_Swot_Opcoes',
  });
  return Concorrentes_Swot_Opcoes;
};