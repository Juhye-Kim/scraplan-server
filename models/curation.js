"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Curation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Curation.hasMany(models.CurationCard, {
        foreignKey: "CurationId",
      });
    }
  }
  Curation.init(
    {
      coordinates: DataTypes.GEOMETRY,
      address: DataTypes.STRING,
      themeInfo: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "Curation",
    }
  );
  return Curation;
};
