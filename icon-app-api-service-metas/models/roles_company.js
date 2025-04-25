'use strict';
module.exports = (sequelize, DataTypes) => {
  const Roles_Company = sequelize.define('Roles_Company', {
    id: {
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      unique: true
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    hidden: DataTypes.BOOLEAN,
  }, {});
  Roles_Company.associate = function (models) {
    Roles_Company.belongsToMany(models.Empresas, {
      through: 'Empresas_Roles_Company', foreignKey: 'company_id', as: 'empresasRolesCompany'
    });
    Roles_Company.belongsToMany(models.Permissions, {
      through: 'Permissions_Roles_Company', foreignKey: 'role_company_id', as: 'permissionsRolesCompany'
    });
  };
  return Roles_Company;
};