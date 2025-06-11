'use strict';
module.exports = (sequelize, DataTypes) => {
  const Roles = sequelize.define('Roles', {
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
  Roles.associate = function (models) {
    Roles.belongsToMany(models.Usuario_Migrar, {
      through: 'Users_Roles', foreignKey: 'role_id', as: 'users'
    });
    Roles.belongsToMany(models.Permissions, {
      through: 'Permissions_Roles', foreignKey: 'role_id', as: 'permissions'
    });
  };
  return Roles;
};