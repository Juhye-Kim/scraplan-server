"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CurationCard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.CurationCard.hasMany(models.CurationFeedback, {
        foreignKey: "CurationCardId",
      });
      models.CurationCard.belongsTo(models.Curation, {
        foreignKey: "CurationId",
      });
    }
  }
  CurationCard.init(
    {
      CurationId: DataTypes.INTEGER,
      theme: DataTypes.INTEGER,
      title: DataTypes.STRING,
      detail: DataTypes.STRING,
      photo: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "CurationCard",
    }
  );
  return CurationCard;
};
