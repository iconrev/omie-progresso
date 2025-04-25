'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Dre_Despesas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Dre_Despesas.belongsTo(models.Dre, {
        foreignKey: 'dre_id', as: 'dre'
      })
    }
  }
  Dre_Despesas.init({
    dre_id: DataTypes.INTEGER,
    key: DataTypes.STRING,
    description: DataTypes.STRING,
    value: DataTypes.FLOAT(10, 2),
    editable: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Dre_Despesas',
  });
  return Dre_Despesas;
};