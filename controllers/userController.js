const Menu = require('../models/menu'); // Import the Menu model
const Order = require('../models/order');
const Address = require('../models/address'); 
const { Op } = require('sequelize');

// Get menus for current, next, and next to next date
exports.getMenus = async (req, res) => {
  const today = new Date();
  const nextDay = new Date();
  const nextNextDay = new Date();

  // Set the next dates
  nextDay.setDate(today.getDate() + 1);
  nextNextDay.setDate(today.getDate() + 2);

  try {
    // Fetch menus for the specified dates where isPublished is true
    const menus = await Menu.findAll({
      where: {
        date: {
          [Op.or]: [
            today.toISOString().split('T')[0], // Current date
            nextDay.toISOString().split('T')[0], // Next date
            nextNextDay.toISOString().split('T')[0] // Next to next date
          ]
        },
        isPublished: true // Only return published menus
      },
      order: [['date', 'ASC']], // Order by date
    });

    return res.status(200).json({
      message: 'Menus retrieved successfully',
      menus,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while retrieving menus' });
  }
};

// Add a new order
exports.addOrder = async (req, res) => {
  const { address_id, mobile_no, menus, note } = req.body;

  try {
    const newOrder = await Order.create({
      address_id,
      mobile_no,
      menus, // This should be formatted correctly in your model
      note: note || null, // note can be null if not provided
      status: 'pending', // Default status if not provided
      delivery_boy_id: null, // Default if not provided
      payment_status: 'pending'
    });

    // Initialize total amount
    let totalAmount = 0;

    // Fetch menu details for each menu_id
    const menuDetailsPromises = menus.map(async (menu) => {
      const menuItem = await Menu.findOne({ where: { id: menu.menu_id, isPublished: true } });
      if (!menuItem) {
        throw new Error(`Menu item with ID ${menu.menu_id} not found or not published.`);
      }
      const itemTotal = menuItem.price * menu.quantity; // Calculate total for this menu item
      totalAmount += itemTotal; // Add to total amount

      return {
        ...menuItem.toJSON(),
        itemTotal, // Total price for this menu item
      };
    });

    // Wait for all menu details to be fetched
    const detailedMenus = await Promise.all(menuDetailsPromises);

    // Construct response
    return res.status(200).json({
      message: 'Order added successfully',
      order: {
        ...newOrder.toJSON(),
        menuItems: detailedMenus,
        totalAmount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while adding the order' });
  }
};

// Get all addresses
exports.getAllAddresses = async (req, res) => {
    try {
      const addresses = await Address.findAll(); // Retrieve all addresses from the database
  
      return res.status(200).json({
        message: 'Addresses retrieved successfully',
        addresses, // Return the retrieved addresses
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message || 'An error occurred while retrieving addresses' });
    }
  };

// Get order details by mobile number
exports.getOrderDetailsByMobile = async (req, res) => {
  const { mobile_no } = req.body;

  try {
    // Find orders for the given mobile number where status is not 'done'
    const orders = await Order.findAll({
      where: {
        mobile_no,
        status: { [Op.not]: 'done' } // Use Sequelize's Op to filter
      }
    });

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for the given mobile number or all orders are completed.' });
    }

    // Initialize an array to hold order details
    const orderDetailsPromises = orders.map(async (order) => {

      const address = await Address.findOne({ where: { id: order.address_id } });

      // Get the associated menu items for the order
      const menuItems = await Promise.all(order.menus.map(async (menu) => {
        const menuItem = await Menu.findOne({ where: { id: menu.menu_id } });
        return {
          ...menuItem.toJSON(), // Include all properties from menuItem
          quantity: menu.quantity, // Include the quantity from the order
          itemTotal: menuItem.price * menu.quantity // Calculate total for this menu item
        };
      }));

      // Calculate total amount for the order
      const totalAmount = menuItems.reduce((sum, item) => sum + item.itemTotal, 0);

      // Return detailed order information
      return {
        id: order.id,
        address: address,
        mobile_no: order.mobile_no,
        orderDate: order.createdAt, // Assuming createdAt is the order date
        status: order.status,
        payment_status: order.payment_status,
        menus: menuItems,
        totalAmount // Total amount for the order
      };
    });

    // Wait for all promises to resolve
    const detailedOrders = await Promise.all(orderDetailsPromises);

    return res.status(200).json({
      message: 'Order details retrieved successfully',
      orders: detailedOrders
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'An error occurred while retrieving order details' });
  }
};

