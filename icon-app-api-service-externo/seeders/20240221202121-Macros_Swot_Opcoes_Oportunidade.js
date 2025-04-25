"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert(
      "Macros_Swot_Opcoes_Oportunidades",
      [
        {
          EmpresaId: null,
          descricao: "Acesso a fontes de financiamentos do governo",
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Adequar negócio para atender órgãos governamentais",
          id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Atrair investidores para alavancagem do negócio",
          id: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Atualização tecnológica em ambiente digital",
          id: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Aumentar competências organizacionais",
          id: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Automação das rotinas administrativas",
          id: 6,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Automação para indústria 4.0",
          id: 7,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Capacitação dos colaboradores através do sistema S",
          id: 8,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Desenvolver novos produtos e/ou serviços",
          id: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Desenvolver parcerias internacionais",
          id: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao:
            "Desenvolver soluções por perfil socioeconômico de clientes",
          id: 11,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Fusões & Aquisições (M&A)",
          id: 12,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Importação de produtos, insumos ou máquinas",
          id: 13,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Incorporar as novas tecnologias emergentes",
          id: 14,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Inovar modelo de negócios/reposicionamento no mercado",
          id: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Melhorar modelo de governança",
          id: 16,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Ofecer soluções adequada as novas tendências culturais",
          id: 17,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Parceria com startups tecnológicas",
          id: 18,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Realizar hedge cambial",
          id: 19,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao:
            "Redução de custos de folha com flexibilização trabalhista",
          id: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Redução de custos por simplificação tributária",
          id: 21,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Regularização a legislação vigente",
          id: 22,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Segmentação de clientes e mercado",
          id: 23,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          EmpresaId: null,
          descricao: "Substituição de materiais e/ou serviços por inovação",
          id: 24,
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
