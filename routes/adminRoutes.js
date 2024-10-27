const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateLogin, loginValidationResult } = require('../validators/loginValidator')
const { validateMenu, menuValidationResult, validateEditMenu } = require('../validators/menuValidator');
const {
    validateAddress,
    addressValidationResult,
    validateAddressId,
  } = require('../validators/addressValidator');
const { validateDeliveryBoy, deliveryBoyValidationResult } = require('../validators/deliveryBoyValidator');
const { validateOrderFilter, validateOrderAssignment } = require('../validators/orderValidator');

router.post('/login', validateLogin, loginValidationResult, adminController.adminLogin);

router.get('/menu', authMiddleware, adminController.getAllMenus);
router.post('/menu', authMiddleware, validateMenu, menuValidationResult, adminController.addMenus);
router.put('/menu/:id', authMiddleware, validateEditMenu, menuValidationResult, adminController.editMenu);

router.post('/address', authMiddleware, validateAddress, addressValidationResult, adminController.addAddress);
router.put('/address/:id', authMiddleware, validateAddressId, validateAddress, addressValidationResult, adminController.editAddress);
router.delete('/address/:id',authMiddleware, validateAddressId, adminController.deleteAddress);

router.post('/deliveryboy', authMiddleware, validateDeliveryBoy, deliveryBoyValidationResult, adminController.addDeliveryBoy);
router.put('/deliveryboy/:id', authMiddleware, validateDeliveryBoy, deliveryBoyValidationResult, adminController.editDeliveryBoy);
router.delete('/deliveryboy/:id', authMiddleware, adminController.deleteDeliveryBoy);
router.get('/delivery-boys', authMiddleware, adminController.getAllDeliveryBoys);

router.post('/orders/filter', authMiddleware, validateOrderFilter, adminController.getOrdersByDateAndShift);
router.put('/assign-orders', authMiddleware, validateOrderAssignment, adminController.assignOrdersToDeliveryBoy);

module.exports = router;
