'use strict';
module.exports = (sequelize, DataTypes) => {
  const Vendas_Avaliacao = sequelize.define('Vendas_Avaliacao', {
    EmpresaId: DataTypes.STRING,
    ano_exercicio: DataTypes.INTEGER,
    propostas_enviadas_no_ano: DataTypes.STRING,
    novos_clientes_no_ano: DataTypes.STRING,
    notas_fiscais_emitidas: DataTypes.STRING,
    clientes_fidelizados: DataTypes.STRING,
    carteira_de_clientes_ativa: DataTypes.STRING,
    reclamacoes_clientes: DataTypes.STRING,
    clientes_perdidos: DataTypes.STRING,
    propostas_aprovadas_no_ano: DataTypes.STRING,
    ticket_medio: DataTypes.STRING,
    taxa_conversao: DataTypes.STRING,
    percentual_clientes_ativos: DataTypes.STRING,
    base_clientes: DataTypes.STRING,
    nivel_relacionamento_clientes: DataTypes.STRING,
    taxa_reclamacao_nf: DataTypes.STRING,
  }, {});
  Vendas_Avaliacao.associate = function (models) {
  };
  return Vendas_Avaliacao;
};