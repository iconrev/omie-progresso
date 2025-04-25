'use strict';
const { swot_oportunidades, swot_ameacas } = require("../core/models/analiseDataModels/Cliente")
const { Swot_Intensidade } = require("../core/models/analise_data")


module.exports = (sequelize, DataTypes) => {
  const Clientes_Swot = sequelize.define('Clientes_Swot', {
    oportunidadeId: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('oportunidadeId')
        return swot_oportunidades[rawValue] ?? "-"
      },
      validate: {
        invalidObjetivoId(value) {
          if (value > 13) {
            throw new Error(`A Oportunidade possui um valor inválido: ${this.oportunidadeId}`);
          }
        }
      }
    },
    atratividade_da_oportunidade: {
      type: DataTypes.STRING, get() {
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
    ano_exercicio: DataTypes.STRING,
    ameacaId: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('ameacaId')
        return swot_ameacas[rawValue] ?? "-"
      },
      validate: {
        invalidObjetivoId(value) {
          if (value > 13) {
            throw new Error(`A Ameaça possui um valor inválido: ${this.oportunidadeId}`);
          }
        }
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
    EmpresaId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { // Questionario_Swot belongsTo Company 1:1
        model: 'Empresas',
        key: 'id'
      }
    }
  }, {});
  Clientes_Swot.associate = function (models) {

  };
  return Clientes_Swot;
};