"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CurationFeedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.CurationFeedback.belongsTo(models.User, {
        foreignKey: "UserId",
      });
      models.CurationFeedback.belongsTo(models.CurationCard, {
        foreignKey: "CurationCardId",
      });
    }
  }
  CurationFeedback.init(
    {
      UserId: DataTypes.INTEGER,
      CurationCardId: DataTypes.INTEGER,
      times: DataTypes.FLOAT,
      comment: DataTypes.STRING,
      rate: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "CurationFeedback",
    }
  );
  return CurationFeedback;
};
