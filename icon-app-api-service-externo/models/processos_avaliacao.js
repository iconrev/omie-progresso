'use strict';
module.exports = (sequelize, DataTypes) => {
  const Processos_Avaliacao = sequelize.define('Processos_Avaliacao', {
    funcionarios: DataTypes.STRING,
    EmpresaId: DataTypes.STRING,
    ano_exercicio: DataTypes.INTEGER,
    volume_produzido_no_ano: DataTypes.STRING,
    capacidade_produzida: DataTypes.STRING,
    refugo_retrabalho: DataTypes.STRING,
    custos_garantia: DataTypes.STRING,
    entregas_no_prazo: DataTypes.STRING,
    valor_do_estoque: DataTypes.STRING,
    percentual_capacidade_produtiva: DataTypes.STRING,
    percentual_disponibilidade_equipamento: DataTypes.STRING,
    quantidade_entregue_funcionarios: DataTypes.STRING,
    produtividade: DataTypes.STRING,
    quantidade_giro_estoque: DataTypes.STRING,
    faturamento_custo_folha: DataTypes.STRING,
  }, {});
  Processos_Avaliacao.associate = function (models) {
    Processos_Avaliacao.belongsTo(models.Processos, { foreignKey: 'ProcessoId' });
  };
  return Processos_Avaliacao;
};