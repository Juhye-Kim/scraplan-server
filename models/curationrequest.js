"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CurationRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.CurationRequest.belongsTo(models.User, {
        foreignKey: "UserId",
      });
    }
  }
  CurationRequest.init(
    {
      UserId: DataTypes.INTEGER,
      coordinates: DataTypes.GEOMETRY,
      address: DataTypes.STRING,
      requestTitle: DataTypes.STRING,
      requestComment: DataTypes.STRING,
      requestTheme: DataTypes.INTEGER,
      status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "CurationRequest",
    }
  );
  return CurationRequest;
};
