'use strict';
module.exports = (sequelize, DataTypes) => {
  const Permissions = sequelize.define('Permissions', {
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
  Permissions.associate = function (models) {
    Permissions.belongsToMany(models.Roles, {
      through: 'Permissions_Roles', foreignKey: 'permission_id', as: 'roles'
    });
  };
  return Permissions;
};