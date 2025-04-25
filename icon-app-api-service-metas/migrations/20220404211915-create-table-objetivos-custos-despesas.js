'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Objetivo_Custos_Despesas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      objetivo_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Objetivo_Custos', key: 'id' },
        onDelete: 'CASCADE',
      },
      despesa_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      description: {
        allowNull: false,
        type: Sequelize.STRING
      },
      value: {
        allowNull: false,
        type: Sequelize.FLOAT(10, 2)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Objetivo_Custos_Despesas');
  }
};
