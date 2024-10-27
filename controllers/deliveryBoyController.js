const DeliveryBoy = require('../models/delivery_boy');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
  const { delivery_boy_id } = req.params;

  try {
    // Build the query conditions
    const whereConditions = {
      delivery_boy_id,
      date,
      shift,
      payment_status: 'done',
      ...(status && { status }) // Only add status condition if it’s provided
    };

    // Query to fetch assigned orders with related details
    const orders = await Order.findAll({
      where: whereConditions,
      include: [
        {
          model: Menu,
          attributes: ['id', 'date', 'isPublished', 'shift', 'variant', 'description', 'menu_items', 'price', 'status'],
        },
        {
          model: Address,
          attributes: ['id', 'address', 'zipcode', 'shortname'],
        }
      ]
    });

    // Check if no orders found
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for the given criteria.' });
    }

    // Return orders with detailed information
    return res.status(200).json({
      message: 'Assigned orders retrieved successfully',
      data: orders,
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

