'use strict';
module.exports = (sequelize, DataTypes) => {
    const Empresas_Premium = sequelize.define('Empresas_Premium', {
        company_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'Empresas',
                key: 'id'
            }
        },
        data_inicio_premium: DataTypes.DATE,
        data_final_premium: DataTypes.DATE,
        empresa_homologada: DataTypes.BOOLEAN,
    }, {});
    Empresas_Premium.associate = function (models) {
        Empresas_Premium.belongsTo(models.Empresas, {foreignKey: 'company_id'});
    };
    return Empresas_Premium;
}