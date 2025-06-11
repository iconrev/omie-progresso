"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert(
      "Macros_Swot_Opcoes_Ameacas",
      [
        {
          EmpresaId: null,
          descricao: "Aumento de custos pela valorização cambial",
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao:
            "Perda de receita pelo alto no desemprego/recessão econômica",
          id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Queda de Receitas",
          id: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao:
            "Não acessar recursos de investimentos para atualização tecnológica",
          id: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Multas por não atender legislação",
          id: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Processos trabalhistas",
          id: 6,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Perda de colaboradores chave para o mercado",
          id: 7,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Carga tributária inviabiliza rentabilidade mínima",
          id: 8,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Multas pela receita federal",
          id: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Tempo excessivo para importação",
          id: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Obsolescência dos produtos ou serviços",
          id: 11,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Perda de mercado por substituição tecnológica",
          id: 12,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Perda de competitividade para produtos importados",
          id: 13,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Falta de estrutura/recursos nos projetos estratégicos",
          id: 14,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Pressão nos custos de insumos",
          id: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Falta de mão de obra qualificada",
          id: 16,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Resistência cultural as mudanças necessárias",
          id: 17,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Não atender demanda das novas gerações",
          id: 18,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Necessidade de altos investimentos",
          id: 19,
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
