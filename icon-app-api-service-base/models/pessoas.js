'use strict';
module.exports = (sequelize, DataTypes) => {
  const Pessoas = sequelize.define('Pessoas', {
    EmpresaId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Empresas',
        key: 'id'
      }
    },
    ano_exercicio: DataTypes.INTEGER,
    funcionarios_antigos: DataTypes.FLOAT,
    rotatividade: DataTypes.FLOAT,
    absenteismo: DataTypes.FLOAT,
    competencia_operacao: {
      type: DataTypes.STRING(150)
    },
    competencia_adm: {
      type: DataTypes.STRING(150)
    },
    competencia_gerenciais: {
      type: DataTypes.STRING(150)
    },
    engajamento_relacionamento_interpessoal: {
      type: DataTypes.STRING(150)
    },
    engajamento_motivacao_comprometimento: {
      type: DataTypes.STRING(150)
    },
    engajamento_comunicacao_interna: {
      type: DataTypes.STRING(150)
    },
    engajamento_clima_organizacional: {
      type: DataTypes.STRING(150)
    },
    retencao_plano_carreira: {
      type: DataTypes.STRING(150)
    },
    retencao_cargo_salario: {
      type: DataTypes.STRING(150)
    },
    retencao_avaliacao_desempenho: {
      type: DataTypes.STRING(150)
    },
    retencao_reconhecimento_pessoas: {
      type: DataTypes.STRING(150)
    },
    retencao_recompensa: {
      type: DataTypes.STRING(150)
    },
    faturamento_oriundo_inovacao: DataTypes.FLOAT,
    total_inovacao_implementada_empresa: DataTypes.FLOAT
  }, {});
  Pessoas.associate = function (models) {
    // associations can be defined here
  };
  return Pessoas;
};