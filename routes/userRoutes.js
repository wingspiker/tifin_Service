const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateOrder, orderValidationResult } = require('../validators/orderValidator');

// Route to get menus for current, next, and next to next date
router.get('/menus',userController.getMenus);
router.post('/order', validateOrder, orderValidationResult, userController.addOrder);
router.get('/addresses', userController.getAllAddresses);
router.post('/orders/details', userController.getOrderDetailsByMobile);

module.exports = router;
