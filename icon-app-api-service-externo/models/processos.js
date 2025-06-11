'use strict';
module.exports = (sequelize, DataTypes) => {
  const Processos = sequelize.define('Processos', {
    EmpresaId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Empresas',
        key: 'id'
      }
    },
    ano_exercicio: DataTypes.INTEGER,
    funcionarios: DataTypes.FLOAT,
    volume_produzido_no_ano: DataTypes.FLOAT,
    capacidade_produzida: DataTypes.FLOAT,
    refugo_retrabalho: DataTypes.FLOAT,
    custos_garantia: DataTypes.FLOAT,
    entregas_no_prazo: DataTypes.FLOAT,
    valor_do_estoque: DataTypes.FLOAT,
    percentual_disponibilidade_equipamento: DataTypes.FLOAT,
  }, {});
  Processos.associate = function (models) {
    // associations can be defined here
  };
  return Processos;
};