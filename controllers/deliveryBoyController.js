const DeliveryBoy = require('../models/delivery_boy');
const Order = require('../models/order');
const Menu = require('../models/menu');
const Address = require('../models/address');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Login delivery boy
exports.loginDeliveryBoy = async (req, res) => {
  const { mobile_no, password } = req.body;

  try {
    // Find the delivery boy by mobile number
    const deliveryBoy = await DeliveryBoy.findOne({ where: { mobile_no } });
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, deliveryBoy.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ id: deliveryBoy.id, mobile_no: deliveryBoy.mobile_no }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expiration time
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      deliveryBoy: {
        id: deliveryBoy.id,
        fullName: deliveryBoy.fullName,
        mobile_no: deliveryBoy.mobile_no,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while logging in' });
  }
};

exports.getAssignedOrders = async (req, res) => {
  const { date, shift, status } = req.query;
  const { mobileNumber } = req.params;

  try {

    const deliveryBoy = await DeliveryBoy.findOne({where: { mobile_no : mobileNumber}})
    let reqDate = new Date(date);

    // Build the query conditions
    const whereConditions = {
      delivery_boy_id : deliveryBoy.id,
      deliveryDate: reqDate,
      shift,
      payment_status: 'done',
      ...(status && { status }) // Only add status condition if it’s provided
    };

    // Query to fetch assigned orders with related details
    const orders = await Order.findAll({
      where: whereConditions
    });

    const orderDetailsPromises = orders.map(async (order) => {
      const address = await Address.findOne({ where: { id: order.address_id } });

      const menuItems = await Promise.all(order.menus.map(async (menu) => {
        const menuItem = await Menu.findOne({ where: { id: menu.menu_id } });
        return {
          id: menuItem.id,
          date: menuItem.date,
          photo_url:menuItem.photo_url,
          isPublished:menuItem.isPublished,
          shift: menuItem.shift,
          status:menuItem.status,
          price: menu.price,
          description:menu.description,
          variant:menu.variant,
          menuItem:menu.menuItems,
          quantity: menu.quantity, // Include the quantity from the order
          itemTotal: menu.price * menu.quantity // Calculate total for this menu item
        };
      }));

      const totalAmount = menuItems.reduce((sum, item) => sum + item.itemTotal, 0);

      return {
        id: order.id,
        address,
        mobile_no: order.mobile_no,
        orderDate: order.createdAt,
        status: order.status,
        shift: order.shift,
        menus: menuItems,
        totalAmount
      };
    });

    const detailedOrders = await Promise.all(orderDetailsPromises);

    // Check if no orders found
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for the given criteria.' });
    }

    // Return orders with detailed information
    return res.status(200).json({
      message: 'Assigned orders retrieved successfully',
      data: detailedOrders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'An error occurred while retrieving assigned orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;

  try {
    // Find the order by orderId
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the order status
    order.status = status;
    await order.save();

    return res.status(200).json({
      message: `Order status updated to ${status} successfully`,
      data: order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'An error occurred while updating the order status' });
  }
};

