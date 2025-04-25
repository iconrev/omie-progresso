'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Objetivo_Custos_Despesas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Objetivo_Custos_Despesas.belongsTo(models.Objetivo_Custos, {
        foreignKey: 'objetivo_id', as: 'objetivo'
      })
    }
  }
  Objetivo_Custos_Despesas.init({
    objetivo_id: DataTypes.INTEGER,
    despesa_id: DataTypes.INTEGER,
    description: DataTypes.STRING,
    value: DataTypes.FLOAT(10, 2),
  }, {
    sequelize,
    modelName: 'Objetivo_Custos_Despesas',
  });
  return Objetivo_Custos_Despesas;
};