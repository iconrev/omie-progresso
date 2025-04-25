'use strict';
module.exports = (sequelize, DataTypes) => {
  const Users_Roles_Company = sequelize.define('Users_Roles_Company', {
    id: {
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      unique: true
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Usuario_Migrar',
        key: 'id'
      }
    },
    role_company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id'
      }
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Empresas',
        key: 'id'
      }
    },
  }, {});
  Users_Roles_Company.associate = function (models) {
  };
  return Users_Roles_Company;
};