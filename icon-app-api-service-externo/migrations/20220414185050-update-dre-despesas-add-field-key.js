"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Dre_Despesas", "key", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "dre_id",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Dre_Despesas', 'key')
  },
};
