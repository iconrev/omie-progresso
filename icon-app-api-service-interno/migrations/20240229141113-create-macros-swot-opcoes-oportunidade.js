'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Macros_Swot_Opcoes_Oportunidades', 
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      EmpresaId: {
        allowNull: true,
        type: Sequelize.STRING(255),
        references: { model: "Empresas", key: "id" },
        onDelete: "CASCADE",
      },
      descricao: {
        type: Sequelize.STRING,
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
    },
    { charset: "latin1", collate: "latin1_swedish_ci" });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Macros_Swot_Opcoes_Oportunidades');
  }
};