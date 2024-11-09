const { DataTypes } = require('sequelize');
const sequelize = require('../config/index');
const Order = require('./order');

const Payment = sequelize.define('Payment', {
  order_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Order,
      key: 'id',
    },
    allowNull: false,
  },
  merchantTransactionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  payment_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('Successful', 'Fail'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  timestamps: true,  // Enables created_at and updated_at
});

module.exports = Payment;
