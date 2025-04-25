'use strict';
module.exports = (sequelize, DataTypes) => {
    const Objetivo_Estrategias_Pessoas = sequelize.define('Objetivo_Estrategias_Pessoas', {
        empresa_id: DataTypes.STRING,
        pessoas_id: DataTypes.INTEGER,
        estrategia_id: DataTypes.INTEGER,
        descricao: DataTypes.STRING,
        field: DataTypes.STRING,
        definida: DataTypes.INTEGER,
        diretriz: DataTypes.STRING,
    }, {});
    Objetivo_Estrategias_Pessoas.associate = function (models) {
        Objetivo_Estrategias_Pessoas.hasOne(
            models.Estrategias, {
                foreignKey: 'id',
                sourceKey: 'estrategia_id'
            }
        );
    };
    return Objetivo_Estrategias_Pessoas;
};