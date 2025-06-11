'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Macros_Swot_Opcoes_Ameacas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Macros_Swot_Opcoes_Ameacas.init({
    EmpresaId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'Empresas',
        key: 'id'
      }
    },
    descricao: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Macros_Swot_Opcoes_Ameacas',
  });
  return Macros_Swot_Opcoes_Ameacas;
};