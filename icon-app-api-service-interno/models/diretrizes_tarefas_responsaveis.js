'use strict';
module.exports = (sequelize, DataTypes) => {
  const Diretrizes_Tarefas_Responsaveis = sequelize.define('Diretrizes_Tarefas_Responsaveis', {
    tarefa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Diretrizes_Tarefas',
        key: 'id'
      }
    },
    responsavel_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Empresa_Responsaveis',
        key: 'id'
      }
    },
  }, {});
  Diretrizes_Tarefas_Responsaveis.associate = function (models) {

  };
  return Diretrizes_Tarefas_Responsaveis;
};