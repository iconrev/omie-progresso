'use strict';
module.exports = (sequelize, DataTypes) => {
  const UsersRoles = sequelize.define('Users_Roles', {
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
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Usuario_Migrar',
        key: 'id'
      }
    },
  }, {});
  UsersRoles.associate = function (models) {
    UsersRoles.belongsTo(models.Usuario_Migrar, {foreignKey: 'user_id'});
    UsersRoles.belongsTo(models.Roles, {foreignKey: 'role_id'});
  };
  return UsersRoles;
};