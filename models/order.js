const { DataTypes } = require('sequelize');
const sequelize = require('../config/index');
const Address = require('./address');
const DeliveryBoy = require('./delivery_boy');

const Order = sequelize.define('Order', {
  address_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Address,
      key: 'id',
    },
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending','isAssigned', 'outForDelivery', 'done', 'unexpected'),
    allowNull: false,
    defaultValue: 'pending',
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'done'),
    allowNull: false,
    defaultValue: 'pending',
  },
  shift: {
    type: DataTypes.ENUM('Lunch', 'Dinner'),
    allowNull: false,
  },
  deliveryDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  mobile_no: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  menus: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  delivery_boy_id: {
    type: DataTypes.INTEGER,
    references: {
      model: DeliveryBoy,
      key: 'id',
    },
    allowNull: true,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,  // Enables created_at and updated_at
});

module.exports = Order;
