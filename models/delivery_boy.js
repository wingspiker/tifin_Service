const { DataTypes } = require('sequelize');
const sequelize = require('../config/index');

const DeliveryBoy = sequelize.define('DeliveryBoy', {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mobile_no: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,  // Enables created_at and updated_at
});

module.exports = DeliveryBoy;
