'use strict';
module.exports = (sequelize, DataTypes) => {
    const Objetivo_Estrategias = sequelize.define('Objetivo_Estrategias', {
        empresa_id: DataTypes.STRING,
        dre_id: DataTypes.INTEGER,
        estrategia_id: DataTypes.INTEGER,
        descricao: DataTypes.STRING,
        definida: DataTypes.INTEGER,
        diretriz: DataTypes.STRING,
    }, {});
    Objetivo_Estrategias.associate = function (models) {
        Objetivo_Estrategias.hasOne(
            models.Estrategias, {
                foreignKey: 'id',
                sourceKey: 'estrategia_id'
            }
        );
    };
    return Objetivo_Estrategias;
};