'use strict';
const { swot_oportunidades, swot_ameacas, fatores } = require("../core/models/analiseDataModels/Macros")
const { Swot_Intensidade } = require("../core/models/analise_data")

module.exports = (sequelize, DataTypes) => {
  const macro = sequelize.define('Macros', {
    EmpresaId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { // Questionario_Swot belongsTo Company 1:1
        model: 'Empresas',
        key: 'id'
      }
    },
    ano_exercicio: DataTypes.STRING,
    fator: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('fator')
        return fatores[rawValue] ?? "-"
      }
    },
    tendencia: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('tendencia')
        return Swot_Intensidade[rawValue] ?? "-"
      }
    },
    oportunidadeId: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('oportunidadeId')
        return swot_oportunidades[rawValue] ?? "-"
      }
    },
    ameacaId: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('ameacaId')
        return swot_ameacas[rawValue] ?? "-"
      }
    },
    atratividade_da_oportunidade: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('atratividade_da_oportunidade')
        return Swot_Intensidade[rawValue] ?? "-"
      }
    },
    probabilidade_de_sucesso_da_oportunidade: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('probabilidade_de_sucesso_da_oportunidade')
        return Swot_Intensidade[rawValue] ?? "-"
      }
    },
    relevancia_da_ameaca: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('relevancia_da_ameaca')
        return Swot_Intensidade[rawValue] ?? "-"
      }
    },
    probabilidade_de_ocorrer_a_ameaca: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('probabilidade_de_ocorrer_a_ameaca')
        return Swot_Intensidade[rawValue] ?? "-"
      }
    },
  }, {});
  macro.associate = function (models) {
    // associations can be defined here
  };
  return macro;
};