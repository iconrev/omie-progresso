'use strict';
module.exports = (sequelize, DataTypes) => {
  const Macro_Swot = sequelize.define('Macro_Swot', {
    oportunidadeId: {
      type: DataTypes.STRING,
      validate: {
        invalidObjetivoId (value) {
          if (value > 13) {
            throw new Error(`A Oportunidade possui um valor inválido: ${this.oportunidadeId}`);
          }
        }
      }
    },
    atratividade_da_oportunidade: DataTypes.STRING,
    probabilidade_de_sucesso_da_oportunidade: DataTypes.STRING,
    ameacaId: {
      type: DataTypes.STRING,
      validate: {
        invalidObjetivoId (value) {
          if (value > 13) {
            throw new Error(`A Ameaça possui um valor inválido: ${this.oportunidadeId}`);
          }
        }
      }
    },
    relevancia_da_ameaca: DataTypes.STRING,
    probabilidade_de_ocorrer_a_ameaca: DataTypes.STRING,
    EmpresaId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { // Questionario_Swot belongsTo Company 1:1
        model: 'Empresas',
        key: 'id'
      }
    }
  }, {});
  Macro_Swot.associate = function(models) {
    
  };
  return Macro_Swot;
};