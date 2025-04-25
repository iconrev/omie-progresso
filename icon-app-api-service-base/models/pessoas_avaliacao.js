'use strict';
module.exports = (sequelize, DataTypes) => {
  const Pessoas_Avaliacao = sequelize.define('Pessoas_Avaliacao', {
    nivel_competencia: DataTypes.STRING(50),
    absenteismo: DataTypes.STRING(50),
    nivel_engajamento: DataTypes.STRING(50),
    funcionarios_antigos: DataTypes.STRING(50),
    rotatividade: DataTypes.STRING(50),
    nivel_retencao: DataTypes.STRING(50),
    faturamento_oriundo_inovacao: DataTypes.STRING,
    total_inovacao_implementada_empresa: DataTypes.STRING,
    EmpresaId: DataTypes.STRING,
    ano_exercicio: DataTypes.INTEGER,
  }, {});
  Pessoas_Avaliacao.associate = function (models) {
  };
  return Pessoas_Avaliacao;
};