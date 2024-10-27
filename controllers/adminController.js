const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Menu = require('../models/Menu');
const Order = require('../models/Order');
const moment = require('moment');
const { Op } = require('sequelize');
const DeliveryBoy = require('../models/delivery_boy');

require('dotenv').config();

exports.adminLogin = (req, res) => {
  const { email, password } = req.body;

  // Verify email and password
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    // Generate JWT token
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({
      message: 'Admin logged in successfully',
      token,
    });
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
};


exports.addMenus = async (req, res) => {
  const menus = req.body;

  try {
    const createdMenus = await Promise.all(
      menus.map(async (menuData) => {
        const { date, isPublished, shift, variant, description, menu_items, price, status } = menuData;
        return await Menu.create({
          date,
          isPublished,
          shift,
          variant,
          description,
          menu_items,
          price,
          status,
          created_at: new Date(),
          updated_at: new Date(),
        });
      })
    );

    return res.status(201).json({
      message: 'Menus added successfully',
      menus: createdMenus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while adding the menus' });
  }
};

// Edit an existing menu
exports.editMenu = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const [updated] = await Menu.update(updates, {
      where: { id },
      returning: true,
    });

    if (updated) {
      const updatedMenu = await Menu.findByPk(id);
      return res.status(200).json({
        message: 'Menu updated successfully',
        menu: updatedMenu,
      });
    }
    return res.status(404).json({ message: 'Menu not found' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the menu' });
  }
};

// Get all menus for the current date, next date, and day after tomorrow
exports.getAllMenus = async (req, res) => {
  const today = moment().format('YYYY-MM-DD');
  const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
  const dayAfterTomorrow = moment().add(2, 'days').format('YYYY-MM-DD');

  try {
    // Fetch menus for today, tomorrow, and day after tomorrow
    const menus = await Menu.findAll({
      where: {
        date: {
          [Op.or]: [today, tomorrow, dayAfterTomorrow],
        },
        isPublished: true,
      },
    });

    return res.status(200).json({
      message: 'Menus retrieved successfully',
      menus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving the menus' });
  }
};

// Add a new address
exports.addAddress = async (req, res) => {
  const { address, zipcode, shortname } = req.body;
  
  try {
    const newAddress = await Address.create({
      address,
      zipcode,
      shortname,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      message: 'Address added successfully',
      address: newAddress,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while adding the address' });
  }
};

// Edit an existing address
exports.editAddress = async (req, res) => {
  const { id } = req.params;
  const { address, zipcode, shortname } = req.body;

  try {
    const [updated] = await Address.update(
      { address, zipcode, shortname, updated_at: new Date() },
      { where: { id } }
    );

    if (updated) {
      const updatedAddress = await Address.findByPk(id);
      return res.status(200).json({
        message: 'Address updated successfully',
        address: updatedAddress,
      });
    }
    return res.status(404).json({ message: 'Address not found' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the address' });
  }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Address.destroy({ where: { id } });

    if (deleted) {
      return res.status(200).json({ message: 'Address deleted successfully' });
    }
    return res.status(404).json({ message: 'Address not found' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the address' });
  }
};

// Add a new delivery boy
exports.addDeliveryBoy = async (req, res) => {
  const { fullName, mobile_no, password } = req.body;

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newDeliveryBoy = await DeliveryBoy.create({
      fullName,
      mobile_no,
      password: hashedPassword, // Save the hashed password
    });
    return res.status(201).json({
      message: 'Delivery boy added successfully',
      deliveryBoy: newDeliveryBoy,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while adding the delivery boy' });
  }
};

// Edit an existing delivery boy
exports.editDeliveryBoy = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const [updated] = await DeliveryBoy.update(updates, {
      where: { id },
      returning: true,
    });

    if (updated) {
      const updatedDeliveryBoy = await DeliveryBoy.findByPk(id);
      return res.status(200).json({
        message: 'Delivery boy updated successfully',
        deliveryBoy: updatedDeliveryBoy,
      });
    }
    return res.status(404).json({ message: 'Delivery boy not found' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the delivery boy' });
  }
};

// Delete an existing delivery boy
exports.deleteDeliveryBoy = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await DeliveryBoy.destroy({
      where: { id },
    });

    if (deleted) {
      return res.status(204).json({ message: 'Delivery boy deleted successfully' });
    }
    return res.status(404).json({ message: 'Delivery boy not found' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the delivery boy' });
  }
};

exports.getAllDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await DeliveryBoy.findAll({
      attributes: { exclude: ['password'] } // Exclude password from the response for security
    });

    if (deliveryBoys.length === 0) {
      return res.status(404).json({ message: 'No delivery boys found.' });
    }

    return res.status(200).json({
      message: 'Delivery boys retrieved successfully',
      data: deliveryBoys
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'An error occurred while retrieving delivery boys' });
  }
};

exports.getOrdersByDateAndShift = async (req, res) => {
  const { date, shift, status, delivery_boy_id, page = 1, limit = 10 } = req.body;

  try {
    // Define query criteria
    const orderQuery = {
      where: {
        orderDate: date,
        shift: shift,
        payment_status: 'done'
      },
      limit,                          // Limit number of records per page
      offset: (page - 1) * limit      // Calculate offset for pagination
    };

    if (status) {
      orderQuery.where.status = status;
    }

    if (delivery_boy_id) {
      orderQuery.where.delivery_boy_id = delivery_boy_id;
    }

    // Fetch paginated orders
    const { count, rows: orders } = await Order.findAndCountAll(orderQuery);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for the given date and shift.' });
    }

    // Fetch order details
    const orderDetailsPromises = orders.map(async (order) => {
      const address = await Address.findOne({ where: { id: order.address_id } });

      const menuItems = await Promise.all(order.menus.map(async (menu) => {
        const menuItem = await Menu.findOne({ where: { id: menu.menu_id } });
        return {
          ...menuItem.toJSON(),
          quantity: menu.quantity,
          itemTotal: menuItem.price * menu.quantity
        };
      }));

      const totalAmount = menuItems.reduce((sum, item) => sum + item.itemTotal, 0);

      return {
        id: order.id,
        address,
        mobile_no: order.mobile_no,
        orderDate: order.orderDate,
        status: order.status,
        shift: order.shift,
        menus: menuItems,
        totalAmount
      };
    });

    const detailedOrders = await Promise.all(orderDetailsPromises);

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      message: 'Orders retrieved successfully',
      orders: detailedOrders,
      pagination: {
        totalOrders: count,
        currentPage: page,
        totalPages,
        limit
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'An error occurred while retrieving orders' });
  }
};

exports.assignOrdersToDeliveryBoy = async (req, res) => {
  const { orderIds, delivery_boy_id } = req.body;

  try {
    // Update orders with delivery_boy_id and status in bulk
    const [updatedCount] = await Order.update(
      { delivery_boy_id, status: 'isAssigned' },
      {
        where: {
          id: orderIds
        }
      }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ message: 'No orders were updated. Please check the orderIds provided.' });
    }

    return res.status(200).json({
      message: `Successfully assigned delivery boy with ID ${delivery_boy_id} to ${updatedCount} orders.`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'An error occurred while updating orders' });
  }
};
