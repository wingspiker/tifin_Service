const { Sequelize } = require('sequelize');
const config = require('./config');
const fs = require('fs');

const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    port: config.development.port, // Specify your remote DB port here
    dialect: config.development.dialect,
    dialectOptions: {
      ssl: {
        require: true, // This enables SSL connection
        ca: fs.readFileSync(config.development.ca).toString(), // Path to your CA certificate file
      }
    }
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = sequelize;