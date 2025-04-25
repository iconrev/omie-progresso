'use strict';
module.exports = (sequelize, DataTypes) => {
  const Diretrizes_Tarefas = sequelize.define('Diretrizes_Tarefas', {
    EmpresaId: DataTypes.STRING,
    ano_exercicio: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    expiration_date: DataTypes.DATE,
    stage: DataTypes.STRING,
    estrategia_id: DataTypes.INTEGER,
    estrategia_perspectiva: DataTypes.STRING,
    estrategia_categoria: DataTypes.STRING,
  }, {});
  Diretrizes_Tarefas.associate = function (models) {
    // associations can be defined here
  };
  return Diretrizes_Tarefas;
};