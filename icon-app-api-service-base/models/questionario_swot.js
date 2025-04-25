'use strict';
module.exports = (sequelize, DataTypes) => {
    const Questionario_Swot = sequelize.define('Questionario_Swot', {
        descricao: DataTypes.STRING,
        resposta: DataTypes.INTEGER,
        EmpresaId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: { // Questionario_Swot belongsTo Company 1:1
                model: 'Empresas',
                key: 'id'
            }
        },
        ano_exercicio: DataTypes.STRING,
        peso: DataTypes.FLOAT,
        resposta2: DataTypes.STRING
    }, {});
    Questionario_Swot.associate = function (models) {

    };
    return Questionario_Swot;
};