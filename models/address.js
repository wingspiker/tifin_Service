const { DataTypes } = require('sequelize');
const sequelize = require('../config/index');

const Address = sequelize.define('Address', {
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  zipcode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shortname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,  // Enables created_at and updated_at
});

module.exports = Address;
