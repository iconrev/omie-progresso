module.exports = (sequelize, DataTypes) => {
    const Empresa_Exercicios = sequelize.define('Empresa_Exercicios', {
        EmpresaId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'Empresas',
                key: 'id'
            }
        },
        ano: DataTypes.INTEGER,
    }, {});
    Empresa_Exercicios.associate = function (models) {
        Empresa_Exercicios.belongsTo(models.Empresas);
    };
    return Empresa_Exercicios;
};