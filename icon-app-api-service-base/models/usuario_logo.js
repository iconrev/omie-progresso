'use strict';
module.exports = (sequelize, DataTypes) => {
  const Usuario_Logo = sequelize.define('Usuario_Logo', {
    UserId: DataTypes.STRING,
    Logo: DataTypes.STRING
  }, {});
  Usuario_Logo.associate = function(models) {
    // associations can be defined here
  };
  return Usuario_Logo;
};