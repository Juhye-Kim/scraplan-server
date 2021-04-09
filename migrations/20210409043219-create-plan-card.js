'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PlanCards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      PlanId: {
        allowNull:false,
        type: Sequelize.INTEGER
      },
      day: {
        allowNull:false,
        type: Sequelize.INTEGER
      },
      startTime: {
        allowNull:false,
        type: Sequelize.STRING
      },
      endTime: {
        allowNull:false,
        type: Sequelize.STRING
      },
      comment: {
        allowNull:false,
        type: Sequelize.STRING
      },
      theme: {
        allowNull:false,
        type: Sequelize.INTEGER
      },
      coordinates: {
        allowNull:false,
        type: Sequelize.GEOMETRY
      },
      address: {
        allowNull:false,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PlanCards');
  }
};