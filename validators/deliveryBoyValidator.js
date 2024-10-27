const { check, validationResult } = require('express-validator');

// Validation rules for adding or editing a delivery boy
exports.validateDeliveryBoy = [
  check('fullName')
    .notEmpty().withMessage('Full name is required'),
  check('mobile_no')
    .isMobilePhone().withMessage('Valid mobile number is required'),
  check('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// Middleware to check for validation errors
exports.deliveryBoyValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
