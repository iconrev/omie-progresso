'use strict';

module.exports = (sequelize, DataTypes) => {
    const Swot_FFC = sequelize.define('Swot_FFC', {
        campo: DataTypes.STRING,
        descricao: DataTypes.STRING,
        ordem: DataTypes.INTEGER,
        origem: DataTypes.STRING
    }, {});
    Swot_FFC.associate = function (models) {
        // associations can be defined here
    };
    return Swot_FFC;
};