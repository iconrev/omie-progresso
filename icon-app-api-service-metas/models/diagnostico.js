'use strict';
module.exports = (sequelize, DataTypes) => {
  const Diagnostico = sequelize.define('Diagnostico', {
    EmpresaId: DataTypes.STRING,
    externo: DataTypes.FLOAT,
    interno: DataTypes.FLOAT,
    questionario: DataTypes.FLOAT
  }, {});
  Diagnostico.associate = function(models) {
    // associations can be defined here
  };
  return Diagnostico;
};