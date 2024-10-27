const { check, validationResult } = require('express-validator');

// Validation rules for adding an order
exports.validateOrder = [
  check('address_id')
    .notEmpty().withMessage('Address ID is required'),
  check('mobile_no')
    .notEmpty().withMessage('Mobile number is required')
    .isMobilePhone().withMessage('Valid mobile number is required'),
  check('menus')
    .isArray().withMessage('Menus must be an array')
    .notEmpty().withMessage('Menus array cannot be empty')
    .custom((menus) => {
      // Custom validation to check each menu object
      menus.forEach(menu => {
        if (!menu.menu_id || !menu.quantity) {
          throw new Error('Each menu object must contain menu_id and quantity');
        }
      });
      return true;
    }),
];

exports.validateOrderFilter = [
  check('date')
    .exists()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be in YYYY-MM-DD format'),

  check('shift')
    .exists()
    .withMessage('Shift is required')
    .isIn(['lunch', 'dinner'])
    .withMessage('Shift must be either "lunch" or "dinner"'),

  check('status')
    .optional()
    .isIn(['pending','isAssigned', 'out_for_delivery', 'done', 'unexpected'])
    .withMessage('Invalid status value'),

  check('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .default(1),

  check('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be a positive integer')
    .default(10),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateOrderAssignment = [
  check('orderIds')
    .isArray({ min: 1 })
    .withMessage('orderIds must be a non-empty array')
    .custom((orderIds) => orderIds.every((id) => Number.isInteger(id)))
    .withMessage('Each orderId must be an integer'),

  check('delivery_boy_id')
    .isInt()
    .withMessage('delivery_boy_id must be an integer'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateOrderQuery = [
  check('date')
    .isISO8601()
    .withMessage('Date must be in YYYY-MM-DD format'),

  check('shift')
    .isIn(['lunch', 'dinner'])
    .withMessage('Shift must be either lunch or dinner'),

  check('status')
    .optional()
    .isIn(['isAssigned', 'outForDelivery'])
    .withMessage('Status must be either isAssigned or out_for_delivery'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateOrderStatusUpdate = [
  check('orderId')
    .isInt()
    .withMessage('orderId must be an integer'),

  check('status')
    .isIn(['out_for_delivery', 'done'])
    .withMessage('Invalid status value'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Middleware to check for validation errors
exports.orderValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
