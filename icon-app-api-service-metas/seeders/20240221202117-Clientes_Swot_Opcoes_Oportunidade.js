"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert(
      "Clientes_Swot_Opcoes_Oportunidades",
      [
        {
          EmpresaId: null,
          descricao: "Aumentar receita nos clientes atuais",
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Aumentar Fatia de Mercado no segmento",
          id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Melhorar nível de serviço e confiabilidade de entrega",
          id: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Oferecer produtos inovadores e diferenciados",
          id: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Oferecer soluções Customizadas",
          id: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Melhorar Governança e Compliance",
          id: 6,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Melhorar relacionamento e atendimento com cliente",
          id: 7,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Produtos/serviços customizados por faixa etária",
          id: 8,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Atender Público por faixa etária",
          id: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Reduzir estoques por consignação",
          id: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Construir excelência operacional",
          id: 11,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Fortalecer parceria com cliente",
          id: 12,
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
