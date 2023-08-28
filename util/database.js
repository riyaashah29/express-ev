const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DB_PASSWORD, {
  host: 'localhost',
  port: process.env.DB_PORT,
  dialect: 'postgres',
});

module.exports = sequelize;