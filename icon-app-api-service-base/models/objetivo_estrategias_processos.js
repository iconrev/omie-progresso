'use strict';
module.exports = (sequelize, DataTypes) => {
    const Objetivo_Estrategias_Processos = sequelize.define('Objetivo_Estrategias_Processos', {
        empresa_id: DataTypes.STRING,
        processos_id: DataTypes.INTEGER,
        estrategia_id: DataTypes.INTEGER,
        descricao: DataTypes.STRING,
        definida: DataTypes.INTEGER,
        diretriz: DataTypes.STRING,
    }, {});
    Objetivo_Estrategias_Processos.associate = function (models) {
        Objetivo_Estrategias_Processos.hasOne(
            models.Estrategias, {
                foreignKey: 'id',
                sourceKey: 'estrategia_id'
            }
        );
    };
    return Objetivo_Estrategias_Processos;
};