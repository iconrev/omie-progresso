module.exports = (sequelize, DataTypes) => {
    const Empresa_Usuario = sequelize.define('Empresa_Usuarios', {
        EmpresaId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'Empresas',
                key: 'id'
            }
        },
        UsuarioId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'Usuario_Migrar',
                key: 'id'
            }
        },
        nome: DataTypes.STRING,
        email: DataTypes.STRING,
        cargo: DataTypes.STRING,
        active: DataTypes.BOOLEAN,
        invited: DataTypes.BOOLEAN,
        accept: DataTypes.BOOLEAN,
        owner: DataTypes.BOOLEAN,
        invitedAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        acceptAt: {
            allowNull: true,
            type: DataTypes.DATE
        },
    }, {});
    Empresa_Usuario.associate = function (models) {
        Empresa_Usuario.belongsTo(models.Empresas, {foreignKey: 'EmpresaId'});
        Empresa_Usuario.belongsTo(models.Usuario_Migrar, {foreignKey: 'UsuarioId'});
    };
    return Empresa_Usuario;
};