module.exports = (sequelize, DataTypes) => {
    const Empresa_Responsaveis = sequelize.define('Empresa_Responsaveis', {
        EmpresaId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'Empresas',
                key: 'id'
            }
        },
        nome: DataTypes.STRING,
        email: DataTypes.STRING,
        cargo: DataTypes.STRING,
        active: DataTypes.BOOLEAN,
    }, {});
    Empresa_Responsaveis.associate = function (models) {
        Empresa_Responsaveis.belongsTo(models.Empresas);
    };
    return Empresa_Responsaveis;
};