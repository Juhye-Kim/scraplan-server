'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Plans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        allowNull:false,
        type: Sequelize.STRING
      },
      desc: {
        type: Sequelize.STRING
      },
      public: {
        allowNull:false,
        type: Sequelize.BOOLEAN
      },
      UserId: {
        allowNull:false,
        type: Sequelize.INTEGER
      },
      dayCount: {
        allowNull:false,
        type: Sequelize.INTEGER
      },
      representAddr: {
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
    await queryInterface.dropTable('Plans');
  }
};