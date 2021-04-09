'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CurationRequests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
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
      requestTitle: {
        allowNull:false,
        type: Sequelize.STRING
      },
      requestComment: {
        type: Sequelize.STRING
      },
      requestTheme: {
        allowNull:false,
        type: Sequelize.INTEGER
      },
      status: {
        allowNull:false,
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('CurationRequests');
  }
};