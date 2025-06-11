'use strict';
module.exports = (sequelize, DataTypes) => {
    const Questionarios_Avaliacao = sequelize.define('Questionarios_Avaliacao', {
        label: DataTypes.STRING,
        value: DataTypes.STRING,
    }, {});
    return Questionarios_Avaliacao;
};