'use strict';
module.exports = (sequelize, DataTypes) => {
  const Diretrizes_Tarefas_Atividades = sequelize.define('Diretrizes_Tarefas_Atividades', {
    tarefa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Diretrizes_Tarefas',
        key: 'id'
      }
    },
    usuario_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Usuario_Migrar',
        key: 'id'
      }
    },
    comentario: DataTypes.STRING,
    ts_local: DataTypes.STRING,
    visivel: DataTypes.BOOLEAN,
  }, {});
  Diretrizes_Tarefas_Atividades.associate = function (models) {

  };
  return Diretrizes_Tarefas_Atividades;
};