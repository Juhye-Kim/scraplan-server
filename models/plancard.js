"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PlanCard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.PlanCard.belongsTo(models.Plan, {
        foreignKey: "PlanId",
      });
    }
  }
  PlanCard.init(
    {
      PlanId: DataTypes.INTEGER,
      day: DataTypes.INTEGER,
      startTime: DataTypes.STRING,
      endTime: DataTypes.STRING,
      comment: DataTypes.STRING,
      theme: DataTypes.INTEGER,
      coordinates: DataTypes.GEOMETRY,
      address: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "PlanCard",
    }
  );
  return PlanCard;
};
