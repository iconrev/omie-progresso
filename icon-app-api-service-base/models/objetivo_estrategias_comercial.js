'use strict';
module.exports = (sequelize, DataTypes) => {
    const Objetivo_Estrategias_Comercial = sequelize.define('Objetivo_Estrategias_Comercial', {
        empresa_id: DataTypes.STRING,
        vendas_id: DataTypes.INTEGER,
        estrategia_id: DataTypes.INTEGER,
        descricao: DataTypes.STRING,
        field: DataTypes.STRING,
        definida: DataTypes.INTEGER,
        diretriz: DataTypes.STRING,
    }, {});
    Objetivo_Estrategias_Comercial.associate = function (models) {
        Objetivo_Estrategias_Comercial.hasOne(
            models.Estrategias, {
                foreignKey: 'id',
                sourceKey: 'estrategia_id'
            }
        );
    };
    return Objetivo_Estrategias_Comercial;
};