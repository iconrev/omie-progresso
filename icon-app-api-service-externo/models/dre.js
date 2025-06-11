'use strict';

module.exports = (sequelize, DataTypes) => {
  const Dre = sequelize.define('Dre', {
    EmpresaId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { // Questionario_Swot belongsTo Company 1:1
        model: 'Empresas',
        key: 'id'
      }
    },
    ano_exercicio: DataTypes.INTEGER,
    receita_servico: DataTypes.DOUBLE,
    receita_produto: DataTypes.DOUBLE,
    outras_receitas: DataTypes.DOUBLE,
    imposto_sobre_receitas: DataTypes.DOUBLE,
    devolucao_abatimentos: DataTypes.DOUBLE,
    custo_das_mercadorias_vendidas: DataTypes.DOUBLE,
    custo_dos_produtos_industrializados: DataTypes.DOUBLE,
    despesas_com_pessoal: DataTypes.DOUBLE,
    despesas_administrativas: DataTypes.DOUBLE,
    despesas_ocupacao: DataTypes.DOUBLE,
    despesas_logistica: DataTypes.DOUBLE,
    despesas_vendas: DataTypes.DOUBLE,
    despesas_viagens: DataTypes.DOUBLE,
    despesas_servicos_pj: DataTypes.DOUBLE,
    despesas_tributarias: DataTypes.DOUBLE,
    receitas_financeiras: DataTypes.DOUBLE,
    despesas_financeiras: DataTypes.DOUBLE,
    alienacao_ativo_fixo: DataTypes.DOUBLE,
    despesas_indedutiveis: DataTypes.DOUBLE,
    irpj_e_csll: DataTypes.DOUBLE,
    imposto_de_renda: DataTypes.DOUBLE,
    constribuicao_social: DataTypes.DOUBLE,
    depreciacao_amortizacao: DataTypes.DOUBLE,
    endividamento: DataTypes.DOUBLE,
    inadimplencia: DataTypes.DOUBLE
  }, {});
  Dre.associate = function (models) {
    // associations can be defined here
    Dre.hasMany(models.Dre_Despesas, {
      foreignKey: 'dre_id', as: 'dre',
    })
  };
  return Dre;
};