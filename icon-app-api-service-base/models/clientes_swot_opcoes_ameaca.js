'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Clientes_Swot_Opcoes_Ameacas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Clientes_Swot_Opcoes_Ameacas.init({
    EmpresaId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: { // Clientes_Swot_Opcoes_Ameacas belongsTo Company 1:1
        model: 'Empresas',
        key: 'id'
      }
    },
    descricao: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Clientes_Swot_Opcoes_Ameacas',
  });
  return Clientes_Swot_Opcoes_Ameacas;
};