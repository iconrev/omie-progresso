"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert(
      "Fornecedores_Swot_Opcoes_Ameacas",
      [
        {
          EmpresaId: null,
          descricao: "Aumento de custos pela qualidade do fornecedor",
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao:
            "Perda de confiabilidade junto ao cliente por falha do fornecedor",
          id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Aumento de Custos por reajustes não planejados",
          id: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Obsolescência de Produtos/Serviços",
          id: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Receber multas por falha do fornecedor",
          id: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao:
            "Perda de mercado/clientes por baixa confiabilidade do fornecedor",
          id: 6,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Aumento de estoques de segurança",
          id: 7,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao:
            "Baixa capacidade de negociação de prazos e custos com fornecedor",
          id: 8,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Falta de insumos e matéria prima",
          id: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Dependência de fornecedores chave",
          id: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
