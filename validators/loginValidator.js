const { check, validationResult, body } = require('express-validator');

// Validation rules for login
const validateLogin = [
  body().custom((value) => {
    if (!value.email && !value.mobile_no) {
      throw new Error('Either email or mobile number is required');
    }
    return true;
  }),

  // Conditional validation for email
  check('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),

  // Conditional validation for mobile number
  check('mobile_no')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid mobile number'),

  // Password validation (required)
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Middleware to handle validation result
const loginValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateLogin,
  loginValidationResult,
};
