'use strict';
module.exports = (sequelize, DataTypes) => {
    const Empresas = sequelize.define('Empresas', {
        id: {
            autoIncrement: false,
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING,     
            unique: true       
          },
        nome: DataTypes.STRING,
        cnpj: DataTypes.STRING,
        tipo: {
          type: DataTypes.STRING(150),
          allowNull: true,
          after: "cnpj",
          validate: {
            len: [4, 150],
          },
        },
        active: DataTypes.BOOLEAN,
        demo: DataTypes.BOOLEAN,
    }, {});
    Empresas.associate = function (models) {
        Empresas.belongsToMany(models.Usuario_Migrar, {
            through: 'Empresa_Usuarios', foreignKey: 'EmpresaId', as: 'users'
        });
        Empresas.belongsToMany(models.Roles, {
            through: 'Empresas_Roles_Company', foreignKey: 'company_id', as: 'rolesCompany'
        });
        Empresas.hasMany(models.Empresas_Premium, {as: 'empresasPremium', foreignKey: 'company_id'});
        Empresas.hasMany(models.Usuario_Upgrade, {as: 'empresasHomologadas', foreignKey: 'company_id'});
    };
    return Empresas;
}