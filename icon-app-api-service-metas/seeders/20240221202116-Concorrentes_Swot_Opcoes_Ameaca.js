"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    return queryInterface.bulkInsert(
      "Concorrentes_Swot_Opcoes_Ameacas",
      [
        {
          EmpresaId: null,
          descricao: "Não ter recursos para combater concorrentes",
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Perda de mercado para concorrentes",
          id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Dificuldade de fidelizar clientes",
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
          descricao: "Perda de governança/compliance",
          id: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao:
            "Falta de competência técnica para reagir as ações do concorrente",
          id: 6,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao:
            "Oferecer novas soluções adequada as novas tendencias culturais",
          id: 7,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Falhar em inovar produtos/serviços",
          id: 8,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao:
            "Gerar insatisfação nos clientes por não ter mesmo desempenho do concorrente",
          id: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Redução da rentabilidade para combater concorrentes",
          id: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao:
            "Redução da capacidade de reação a dinâmica dos concorrentes",
          id: 11,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Perda de colaboradores chave para concorrentes",
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
