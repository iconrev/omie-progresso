'use strict';
module.exports = (sequelize, DataTypes) => {
  const Permissions_Roles_Company = sequelize.define('Permissions_Roles_Company', {
    id: {
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      unique: true
    },
    role_company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles_Company',
        key: 'id'
      }
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Permissions',
        key: 'id'
      }
    },
  }, {});
  Permissions_Roles_Company.associate = function (models) {
    Permissions_Roles_Company.belongsTo(models.Permissions, {foreignKey: 'permission_id'});
    Permissions_Roles_Company.belongsTo(models.Roles_Company, {foreignKey: 'role_company_id'});
  };
  return Permissions_Roles_Company;
};