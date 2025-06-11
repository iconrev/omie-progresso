'use strict';
module.exports = (sequelize, DataTypes) => {
    const Questionarios = sequelize.define('Questionarios', {
        questionario_avaliacao_id: DataTypes.INTEGER,
        perspectiva: DataTypes.STRING,
        categoria: DataTypes.STRING,
        descricao: DataTypes.STRING,
        pontuacao: DataTypes.STRING,
        field: DataTypes.STRING,
        tempo_avaliacao: DataTypes.INTEGER,
    }, {});
    Questionarios.associate = function (models) {
        Questionarios.hasOne(
            models.Questionarios_Avaliacao, {
                foreignKey: 'id',
                sourceKey: 'questionario_avaliacao_id'
            }
        );
    };
    return Questionarios;
};