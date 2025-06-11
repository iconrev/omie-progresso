'use strict';
module.exports = (sequelize, DataTypes) => {
  const PermissionsRoles = sequelize.define('Permissions_Roles', {
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
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Permissions',
        key: 'id'
      }
    },
  }, {});
  PermissionsRoles.associate = function (models) {
    PermissionsRoles.belongsTo(models.Permissions, {foreignKey: 'permission_id'});
    PermissionsRoles.belongsTo(models.Roles, {foreignKey: 'role_id'});
  };
  return PermissionsRoles;
};