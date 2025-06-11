module.exports = (sequelize, DataTypes) => {
  const Objetivo_Custos = sequelize.define(
    "Objetivo_Custos",
    {
      dreId: DataTypes.INTEGER,
      EmpresaId: DataTypes.STRING(255),
      imposto_ano_anterior: DataTypes.FLOAT,
      tipo: DataTypes.STRING,
      descricao: DataTypes.STRING,
      imposto_definido: DataTypes.DECIMAL(10, 2),
      depreciacao_amortizacao_definido: DataTypes.DECIMAL(10, 2),
      imposto_sobre_lucro_definido: DataTypes.DECIMAL(10, 2),
      // old fields
      despesas_com_pessoal: DataTypes.FLOAT,
      despesas_administrativas: DataTypes.FLOAT,
      despesas_ocupacao: DataTypes.FLOAT,
      despesas_logistica: DataTypes.FLOAT,
      despesas_vendas: DataTypes.FLOAT,
      despesas_viagens: DataTypes.FLOAT,
      despesas_servicos_pj: DataTypes.FLOAT,
      despesas_tributarias: DataTypes.FLOAT,
      despesas_financeiras: DataTypes.FLOAT,
      custo_dos_produtos_industrializados: DataTypes.FLOAT,
    },
    {}
  );
  // // eslint-disable-next-line func-names
  // Objetivo_Custos.associate = function (models) {
  //   // associations can be defined here
  // };
  return Objetivo_Custos;
};
