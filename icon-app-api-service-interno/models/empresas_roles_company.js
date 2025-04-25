'use strict';
module.exports = (sequelize, DataTypes) => {
  const Empresas_Roles_Company = sequelize.define('Empresas_Roles_Company', {
    id: {
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      unique: true
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id'
      }
    },
    company_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Empresas',
        key: 'id'
      }
    },
  }, {});
  Empresas_Roles_Company.associate = function (models) {
    Empresas_Roles_Company.belongsTo(models.Empresas, {foreignKey: 'company_id'});
    Empresas_Roles_Company.belongsTo(models.Roles, {foreignKey: 'role_id'});
  };
  return Empresas_Roles_Company;
};