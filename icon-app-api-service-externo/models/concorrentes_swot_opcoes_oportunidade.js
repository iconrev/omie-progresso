'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Concorrentes_Swot_Opcoes_Oportunidades extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Concorrentes_Swot_Opcoes_Oportunidades.init({
    EmpresaId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: { // Concorrentes_Swot_Opcoes_Oportunidades belongsTo Company 1:1
        model: 'Empresas',
        key: 'id'
      }
    },
    descricao: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Concorrentes_Swot_Opcoes_Oportunidades',
  });
  return Concorrentes_Swot_Opcoes_Oportunidades;
};