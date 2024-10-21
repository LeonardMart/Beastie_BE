require("dotenv").config();
const Pool = require("pg").Pool;
// const Sequelize = require("sequelize")

// const sequelize = new Sequelize('user_db', 'postgres', 'rilley', {
//   host: 'localhost',
//   dialect: 'postgres',
// });

// try {
//   await sequelize.authenticate();
//   console.log('Connection has been established successfully.');
// } catch (error) {
//   console.error('Unable to connect to the database:', error);
// }

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;