require("dotenv").config();

const config = {
  development: {
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DEV_DATABASE,
    dialect: "mysql",
    timezone: "+09:00",
  },
  production: {
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_PRODUCTION_DATABASE,
    dialect: "mysql",
    timezone: "+09:00",
  },
};

module.exports = config;
