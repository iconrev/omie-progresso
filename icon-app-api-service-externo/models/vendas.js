'use strict';
module.exports = (sequelize, DataTypes) => {
  const Vendas = sequelize.define('Vendas', {
    EmpresaId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Empresas',
        key: 'id'
      }
    },
    ano_exercicio: DataTypes.INTEGER,
    propostas_enviadas_no_ano: DataTypes.INTEGER,
    novos_clientes_no_ano: DataTypes.INTEGER,
    notas_fiscais_emitidas: DataTypes.INTEGER,
    clientes_fidelizados: DataTypes.INTEGER,
    carteira_de_clientes_ativa: DataTypes.INTEGER,
    reclamacoes_clientes: DataTypes.INTEGER,
    clientes_perdidos: DataTypes.INTEGER,
    propostas_aprovadas_no_ano: DataTypes.INTEGER,
    base_clientes: {
      type: DataTypes.INTEGER
    },
    processos_politica_relacionamento_cliente: DataTypes.STRING,
    canais_comunicacao_estruturado: DataTypes.STRING,
    equipe_treinada_para_relacionamento: DataTypes.STRING,
    execucao_plano_relacionamento: DataTypes.STRING,
    atuacao_demanda_identificadas: DataTypes.STRING,
  }, {});
  Vendas.associate = function (models) {
    // associations can be defined here
  };
  return Vendas;
};