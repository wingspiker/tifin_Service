const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateOrder, orderValidationResult } = require('../validators/orderValidator');
const upload = require("../config/multerConfig");
const {signup , login} = require('../controllers/userController');


// Route to get menus for current, next, and next to next date
router.get('/menus',userController.getMenus);
router.post('/order', validateOrder, orderValidationResult, userController.addOrder);
router.get('/addresses', userController.getAllAddresses);
router.post('/orders/details', userController.getOrderDetailsByMobile);
router.post('/payment/initiate', userController.initiatePayment);
router.post('/payment/status', userController.checkPaymentStatus);
router.post("/media/upload", upload.single("image"), userController.uploadImage);
router.get("/media", userController.getAllMedia);
router.post("/signup" , signup);
router.post("/login" , login);

module.exports = router;
