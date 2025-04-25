'use strict';
module.exports = (sequelize, DataTypes) => {
  const Empresas_Premium_Faturamento = sequelize.define('Empresas_Premium_Faturamento', {
    id: {
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      unique: true
    },
    company_id: DataTypes.STRING,
    user_id_request: DataTypes.STRING,
    entidade_faturamento: DataTypes.STRING,
    cpf: DataTypes.STRING,
    nome: DataTypes.STRING,
    cnpj: DataTypes.STRING,
    nome_fantasia: DataTypes.STRING,
    razao_social: DataTypes.STRING,
    telefone: DataTypes.STRING,
    endereco_cep: DataTypes.STRING,
    endereco_logradouro: DataTypes.STRING,
    endereco_numero: DataTypes.STRING,
    endereco_bairro: DataTypes.STRING,
    endereco_complemento: DataTypes.STRING,
    endereco_cidade: DataTypes.STRING,
    endereco_estado: DataTypes.STRING,
    financeiro_contato: DataTypes.STRING,
    financeiro_contato_celular: DataTypes.STRING,
    financeiro_contato_email: DataTypes.STRING,
    fatura_tipo: DataTypes.STRING,
    fatura_valor: DataTypes.FLOAT,
    fatura_recorrencia: DataTypes.STRING,
    fatura_dia_vencimento: DataTypes.INTEGER,
  }, {});
  Empresas_Premium_Faturamento.associate = function (models) {
  };
  return Empresas_Premium_Faturamento;
}