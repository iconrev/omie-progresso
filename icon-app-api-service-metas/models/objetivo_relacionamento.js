'use strict';
module.exports = (sequelize, DataTypes) => {
  const Objetivo_Relacionamento = sequelize.define('Objetivo_Relacionamento', {
    vendasId: DataTypes.INTEGER,
    EmpresaId: DataTypes.STRING,
    tipo: DataTypes.STRING,
    descricao: DataTypes.STRING,
    meta_clientes_fidelizados: DataTypes.FLOAT,
    meta_clientes_fidelizados_previsto: DataTypes.FLOAT,
    meta_nivel_relacionamento: DataTypes.FLOAT,
    meta_nivel_relacionamento_previsto: DataTypes.FLOAT,
    meta_processos_politica_relacionamento_cliente: DataTypes.STRING,
    meta_canais_comunicacao_estruturado: DataTypes.STRING,
    meta_equipe_treinada_para_relacionamento: DataTypes.STRING,
    meta_execucao_plano_relacionamento: DataTypes.STRING,
    meta_atuacao_demanda_identificadas: DataTypes.STRING,
  }, {});
  Objetivo_Relacionamento.associate = function (models) {
    // associations can be defined here
  };
  return Objetivo_Relacionamento;
};