"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Empresas_Integracao_Omie extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Empresas_Integracao_Omie.belongsTo(models.Empresas, {
        foreignKey: 'id', as: 'company'
      })      
    }
  }
  Empresas_Integracao_Omie.init(
    {
      company_id: DataTypes.STRING,
      app_key: DataTypes.STRING,
      app_secret: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Empresas_Integracao_Omie",
    }
  );
  return Empresas_Integracao_Omie;
};
