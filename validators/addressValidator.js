const { body, param, validationResult } = require('express-validator');

// Validation rules for adding/updating addresses
const validateAddress = [
  body('address').isString().withMessage('Address must be a string'),
  body('zipcode').isString().withMessage('Zipcode must be a string'),
  body('shortname').isString().optional().withMessage('Shortname must be a string if provided'),
];

// Middleware to handle validation results
const addressValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation for delete operation
const validateAddressId = [
  param('id').isInt().withMessage('Address ID must be an integer'),
];

module.exports = {
  validateAddress,
  addressValidationResult,
  validateAddressId,
};
