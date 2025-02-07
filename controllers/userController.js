const Menu = require('../models/menu'); // Import the Menu model
const Order = require('../models/order');
const Address = require('../models/address');
const Payment = require('../models/payment');
const axios = require('axios');
const Media = require("../models/media");
const { Op } = require('sequelize');
const cryptoJS = require('crypto-js');

require('dotenv').config();

const PHONEPE_BASE_URL = process.env.PHONEPE_BASE_URL;
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const CALLBACK_URL = process.env.CALLBACK_URL;
const saltKey = process.env.PHONEPE_SALT_KEY;

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
        isPublished: true, // Only return published menus
        status: "Available"
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
    // Initialize total amount
    let totalAmount = 0;
    let shift = "";
    let deliveryDate = "";

    // Fetch menu details for each menu_id
    const menuDetailsPromises = menus.map(async (menu) => {
      const menuItem = await Menu.findOne({ where: { id: menu.menu_id, isPublished: true } });
      if (!menuItem) {
        throw new Error(`Menu item with ID ${menu.menu_id} not found or not published.`);
      }

      menu.price = menuItem.price;
      menu.variant = menuItem.variant;
      menu.description = menuItem.description;
      menu.menuItems = menuItem.menu_items.join(" ")

      const itemTotal = menuItem.price * menu.quantity; // Calculate total for this menu item
      totalAmount += itemTotal; // Add to total amount

      if(shift == ""){
        shift = menuItem.shift
      }else if(shift != menuItem.shift){
        throw new Error("All added menu should be belongs to same shift.")
      }

      if(deliveryDate == ""){
        deliveryDate = menuItem.date;
      }else if(deliveryDate != menuItem.date){
        throw new Error("All added menu should be belongs to same date.")
      }

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
        quantity: menu.quantity, // Calculate total for this menu item,
        itemTotal, // Total price for this menu item
      };
    });

    // Wait for all menu details to be fetched
    const detailedMenus = await Promise.all(menuDetailsPromises);

    const newOrder = await Order.create({
      address_id,
      mobile_no,
      shift,
      deliveryDate,
      menus, // This should be formatted correctly in your model
      note: note || null, // note can be null if not provided
      status: 'pending', // Default status if not provided
      delivery_boy_id: null, // Default if not provided
      payment_status: 'pending'
    });

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
        return {// Include all properties from menuItem
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

// Initialize Payment
exports.initiatePayment = async (req, res) => {
  const { orderId, amount, mobileNumber } = req.body;
  const merchantTransactionId = `ORDER_${orderId}_${Date.now()}`
  const paymentData = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: merchantTransactionId,  // Unique transaction ID
    merchantUserId: `MUID${mobileNumber}`,
    amount: amount * 100,  // Convert to paise
    redirectUrl: CALLBACK_URL + `${merchantTransactionId}`,
    redirectMode: "REDIRECT",
    paymentInstrument: {
      type: 'PAY_PAGE',
    }
  };

  const requestBody = JSON.stringify(paymentData);
  const bufferObj = Buffer.from(requestBody,"utf8")
  const base64Payload = bufferObj.toString("base64")
  const concatenatedString = base64Payload + "/pg/v1/pay" + saltKey;
  const hash = cryptoJS.SHA256(concatenatedString);

  try {
    const response = await axios.post(`${PHONEPE_BASE_URL}/pg/v1/pay`, { request: base64Payload }, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': `${hash}###${process.env.PHONEPE_SALT_KEY_INDEX}`
      }
    });

    if (response.data.success) {
      return res.status(200).json({
        message: 'Payment initiated successfully',
        data: { "url" : response.data.data.instrumentResponse.redirectInfo.url }
      });
    } else {
      return res.status(400).json({ message: 'Payment initiation failed', data: response.data });
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    return res.status(500).json({ error: 'Payment initiation failed' });
  }
};

// Check Payment Status
exports.checkPaymentStatus = async (req, res) => {
  const { merchantTransactionId } = req.body;
  
  const hash = cryptoJS.SHA256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + saltKey)

  try {
    const response = await axios.get(`${PHONEPE_BASE_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': `${hash}###${process.env.PHONEPE_SALT_KEY_INDEX}`,
        'X-MERCHANT-ID': MERCHANT_ID
      }
    });

    const order_id = merchantTransactionId.split("_")[1];

    if(response.data.code == "PAYMENT_SUCCESS"){
      const payment = await Payment.create({
        order_id: order_id,
        payment_id: response.data.data.transactionId,
        merchantTransactionId: merchantTransactionId,
        status: "Successful", // "success" or any other status based on payment
        amount: response.data.data.amount,
      });

      await Order.update({ payment_status: 'done' },{
          where: {
            id: order_id,
          },
        });
      
      return res.status(200).json({message: 'Payment successfull',data: payment,});
    }else
    {
      const payment = await Payment.create({
        order_id: order_id,
        payment_id: response.data.data.transactionId,
        merchantTransactionId: merchantTransactionId,
        status: "Fail", // "success" or any other status based on payment
        amount: response.data.data.amount/100,
      });
      
      return res.status(200).json({message: 'Payment Failed',data: payment,});
    }
  } catch (error) {
    console.error('Payment status check error:', error);
    return res.status(500).json({ error: 'Payment status check failed' });
  }
};

// Upload Image and Save URL in Database
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Construct the file URL
    const fileUrl = req.file.path;

    // Save file URL in Media table
    const media = await Media.create({ file_url: fileUrl });

    return res.status(201).json({
      message: "File uploaded successfully",
      fileLink: media.file_url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to upload image" });
  }
};

// Get all media records in descending order by creation date
exports.getAllMedia = async (req, res) => {
  try {
    const mediaRecords = await Media.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json(mediaRecords);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to retrieve media records" });
  }
};