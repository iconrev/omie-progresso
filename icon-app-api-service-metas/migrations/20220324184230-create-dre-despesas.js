"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Dre_Despesas", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      dre_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Dre", key: "id" },
        onDelete: "CASCADE",
      },
      description: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      value: {
        allowNull: false,
        type: Sequelize.FLOAT(10, 2),
      },
      editable: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Dre_Despesas");
  },
};
