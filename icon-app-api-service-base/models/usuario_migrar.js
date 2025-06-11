'use strict';
module.exports = (sequelize, DataTypes) => {
  const Usuario_Migrar = sequelize.define('Usuario_Migrar', {
    id: {
      autoIncrement: false,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
      unique: true
    },
    nome: DataTypes.STRING,
    email: DataTypes.STRING,
    cognito_id: DataTypes.STRING,
    onboard: DataTypes.BOOLEAN,
    contador: DataTypes.BOOLEAN,
  }, {});
  Usuario_Migrar.associate = function (models) {
    Usuario_Migrar.belongsToMany(models.Roles, {
      through: 'Users_Roles', foreignKey: 'user_id', as: 'roles'
    });
    Usuario_Migrar.belongsToMany(models.Empresas, {
      through: 'Empresa_Usuarios', foreignKey: 'UsuarioId', as: 'companies'
    });
    Usuario_Migrar.hasMany(models.Usuario_Log, {
      foreignKey: 'id_usuario', as: 'logs',
    })
    Usuario_Migrar.hasMany(models.Usuario_Upgrade, {as: 'solicitacaoAssociado', foreignKey: 'user_id'});
  };
  return Usuario_Migrar;
};