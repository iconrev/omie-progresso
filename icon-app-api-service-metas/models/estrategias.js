'use strict';
module.exports = (sequelize, DataTypes) => {
    const Estrategias = sequelize.define('Estrategias', {
        perspectiva: DataTypes.STRING,
        categoria: DataTypes.STRING,
        descricao: DataTypes.STRING,
        quiz: DataTypes.STRING,
    }, {});
    return Estrategias;
};