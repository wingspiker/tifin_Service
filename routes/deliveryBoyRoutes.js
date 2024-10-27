const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const deliveryBoyController = require('../controllers/deliveryBoyController');
const { validateLogin, loginValidationResult } = require('../validators/loginValidator')
const { validateOrderQuery, validateOrderStatusUpdate } = require('../validators/orderValidator');

router.post('/login', validateLogin, loginValidationResult, deliveryBoyController.loginDeliveryBoy);
router.get('/delivery-boy/:delivery_boy_id/orders',authMiddleware, validateOrderQuery, deliveryBoyController.getAssignedOrders);
router.put('/order/status', authMiddleware, validateOrderStatusUpdate, deliveryBoyController.updateOrderStatus);


module.exports = router;
