'use strict';
module.exports = (sequelize, DataTypes) => {
    const Usuario_Convites = sequelize.define('Usuario_Convites', {
        email: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        EmpresaId: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        nomeEmpresa: DataTypes.STRING,
        nome: DataTypes.STRING,
        UsuarioId: DataTypes.STRING,
        cargo: DataTypes.STRING,
        role_company_id: DataTypes.STRING,
        aceito: DataTypes.BOOLEAN,
    }, {});
    Usuario_Convites.associate = function (models) {
        // associations can be defined here
    };
    return Usuario_Convites;
};