'use strict';
module.exports = (sequelize, DataTypes) => {
  const Usuario_Log = sequelize.define('Usuario_Log', {
    id_usuario: {
      type: DataTypes.STRING,
      allowNull: false
    },
    context: {
      type: DataTypes.STRING,
      allowNull: false
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    log: DataTypes.STRING,
    status: DataTypes.STRING,
  }, {});
  Usuario_Log.associate = function (models) {
    Usuario_Log.belongsTo(models.Usuario_Migrar, {
      foreignKey: 'id_usuario', as: 'users'
    })
  };
  return Usuario_Log;
};