"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    const tran = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addConstraint("CurationFeedbacks", {
        fields: ["UserId"],
        type: "foreign key",
        name: "fk_CurationFeedbacks_Users",
        references: {
          table: "Users",
          field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
      });
      await queryInterface.addConstraint("CurationRequests", {
        fields: ["UserId"],
        type: "foreign key",
        name: "fk_CurationRequests_Users",
        references: {
          table: "Users",
          field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
      });
      await queryInterface.addConstraint("Plans", {
        fields: ["UserId"],
        type: "foreign key",
        name: "fk_Plans_Users",
        references: {
          table: "Users",
          field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
      });
      await queryInterface.addConstraint("CurationFeedbacks", {
        fields: ["CurationCardId"],
        type: "foreign key",
        name: "fk_CurationFeedbacks_CurationCards",
        references: {
          table: "CurationCards",
          field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
      });
      await queryInterface.addConstraint("CurationCards", {
        fields: ["CurationId"],
        type: "foreign key",
        name: "fk_CurationCards_Curations",
        references: {
          table: "Curations",
          field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
      });
      await queryInterface.addConstraint("PlanCards", {
        fields: ["PlanId"],
        type: "foreign key",
        name: "fk_PlanCards_Plans",
        references: {
          table: "Plans",
          field: "id",
        },
        onDelete: "cascade",
        onUpdate: "cascade",
      });
      await tran.commit();
    } catch (err) {
      await tran.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    const tran = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint(
        "CurationFeedbacks",
        "fk_CurationFeedbacks_Users",
        {}
      );
      await queryInterface.removeConstraint(
        "CurationRequests",
        "fk_CurationRequests_Users",
        {}
      );
      await queryInterface.removeConstraint("Plans", "fk_Plans_Users", {});
      await queryInterface.removeConstraint(
        "CurationFeedbacks",
        "fk_CurationFeedbacks_CurationCards",
        {}
      );
      await queryInterface.removeConstraint(
        "CurationCards",
        "fk_CurationCards_Curations",
        {}
      );
      await queryInterface.removeConstraint(
        "PlanCards",
        "fk_PlanCards_Plans",
        {}
      );
      await tran.commit();
    } catch (err) {
      await tran.rollback();
      throw err;
    }
  },
};
