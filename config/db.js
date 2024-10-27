const sequelize = require('./index')
const Menu = require('../models/menu');
const Address = require('../models/address');
const DeliveryBoy = require('../models/delivery_boy');
const Order = require('../models/order');
const Payment = require('../models/payment');
const Media = require('../models/media');

// Associations
Order.belongsTo(Address, { foreignKey: 'address_id' });
Order.belongsTo(DeliveryBoy, { foreignKey: 'delivery_boy_id' });
Payment.belongsTo(Order, { foreignKey: 'order_id' });

// sequelize.sync({ force: true })  // Use 'force: true' only in development to recreate tables if needed
//   .then(() => {
//     console.log('Database synced');
//   })
//   .catch(err => {
//     console.error('Error syncing database:', err);
//   });

module.exports = { Menu, Address, DeliveryBoy, Order, Payment, Media };