"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Plan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Plan.hasMany(models.PlanCard, {
        foreignKey: "PlanId",
      });
      models.Plan.belongsTo(models.User, {
        foreignKey: "UserId",
      });
    }
  }
  Plan.init(
    {
      title: DataTypes.STRING,
      desc: DataTypes.STRING,
      public: DataTypes.BOOLEAN,
      UserId: DataTypes.INTEGER,
      dayCount: DataTypes.INTEGER,
      representAddr: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Plan",
    }
  );
  return Plan;
};
