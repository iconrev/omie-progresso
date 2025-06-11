'use strict';
module.exports = (sequelize, DataTypes) => {
  const Usuario_Upgrade = sequelize.define('Usuario_Upgrade', {
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Usuario_Migrar',
        key: 'id'
      }
    },
    company_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Empresas',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    crc: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      default: false,
    },
    comment: {
      type: DataTypes.STRING,
    },
    approver_name: {
      type: DataTypes.STRING,
    },
    approver_date: {
      type: DataTypes.DATE,
    },

  }, {});
  Usuario_Upgrade.associate = function (models) {
    Usuario_Upgrade.belongsTo(models.Empresas, { foreignKey: 'company_id' });
    Usuario_Upgrade.belongsTo(models.Usuario_Migrar, { foreignKey: 'company_id' });
  };
  return Usuario_Upgrade;
};