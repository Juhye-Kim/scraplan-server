"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    updatePassword(password) {
      this.password = bcrypt.hashSync(password.toString(), 10);
    }
    validPassword(password) {
      return bcrypt.compareSync(password.toString(), this.password);
    }
    validGoogleData(googleData) {
      return bcrypt.compareSync(googleData.toString(), this.googleData);
    }
    static associate(models) {
      // define association here
      models.User.hasMany(models.CurationFeedback, {
        foreignKey: "UserId",
      });
      models.User.hasMany(models.Plan, {
        foreignKey: "UserId",
      });
      models.User.hasMany(models.CurationRequest, {
        foreignKey: "UserId",
      });
    }
  }
  User.init(
    {
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      nickname: DataTypes.STRING,
      googleData: DataTypes.STRING,
      latestToken: DataTypes.STRING,
    },
    {
      hooks: {
        beforeCreate: (user) => {
          if (user.password !== "" && user.password) {
            user.password = bcrypt.hashSync(user.password.toString(), 10);
          }
          if (user.googleData)
            user.googleData = bcrypt.hashSync(user.googleData.toString(), 10);
        },
      },
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
