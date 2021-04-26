"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("CurationCards", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      CurationId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      theme: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      detail: {
        type: Sequelize.STRING,
      },
      photo: {
        type: Sequelize.STRING,
      },
      avgTime: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      feedbackCnt: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("CurationCards");
  },
};
