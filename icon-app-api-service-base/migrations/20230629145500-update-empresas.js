"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Empresas", "tipo", {
      type: Sequelize.STRING(150),
      allowNull: true,
      after: "cnpj",
      validate: {
        len: [4, 150],
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Empresas", "tipo");
  },
};
