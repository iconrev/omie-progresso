'use strict';
module.exports = (sequelize, DataTypes) => {
  const MateriaisAssociados = sequelize.define('Materiais_Associados', {
    id: {
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      unique: true
    },
    key: DataTypes.STRING,
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    downloads: DataTypes.INTEGER,
    contentType: DataTypes.STRING,
    filename: DataTypes.STRING,
  }, {});
  MateriaisAssociados.associate = function (models) {

  };
  return MateriaisAssociados;
};