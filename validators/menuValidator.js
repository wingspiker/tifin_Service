const { body,param, validationResult } = require('express-validator');
const moment = require('moment');

// Validation rules for adding menu (array of objects)
const validateMenu = [
  body().isArray().withMessage('Request body must be an array'),

  // Iterate over each object in the array
  body('*.date')
    .custom((date) => {
      const allowedDates = [
        moment().format('YYYY-MM-DD'),
        moment().add(1, 'days').format('YYYY-MM-DD'),
        moment().add(2, 'days').format('YYYY-MM-DD'),
      ];
      if (!allowedDates.includes(date)) {
        throw new Error('Date must be today, tomorrow, or the day after tomorrow');
      }
      return true;
    }),

  body('*.isPublished').isBoolean().withMessage('isPublished must be a boolean'),

  body('*.shift')
    .isIn(['Lunch', 'Dinner'])
    .withMessage('Shift must be either lunch or dinner'),

  body('*.variant')
    .isIn(['Full-Dish', 'Half-Dish'])
    .withMessage('Variant must be either full-dish or half-dish'),

  body('*.description').isString().optional(),

  body('*.menu_items').isArray().withMessage('menu_items must be an array'),

  body('*.price').isFloat().withMessage('Price must be a float'),

  body('*.status')
    .isIn(['Available', 'Closed'])
    .withMessage('Status must be either available or closed'),
];

// Add this to your menuValidator.js
const validateEditMenu = [
  param('id').isInt().withMessage('Menu ID must be an integer'),
  body('date').optional().custom((date) => {
    const allowedDates = [
      moment().format('YYYY-MM-DD'),
      moment().add(1, 'days').format('YYYY-MM-DD'),
      moment().add(2, 'days').format('YYYY-MM-DD'),
    ];
    if (date && !allowedDates.includes(date)) {
      throw new Error('Date must be today, tomorrow, or the day after tomorrow');
    }
    return true;
  }),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be a boolean'),
  body('shift').optional().isIn(['Lunch', 'Dinner']).withMessage('Shift must be either lunch or dinner'),
  body('variant').optional().isIn(['Full-Dish', 'Half-Dish']).withMessage('Variant must be either full-dish or half-dish'),
  body('description').optional().isString(),
  body('menu_items').optional().isArray().withMessage('menu_items must be an array'),
  body('price').optional().isFloat().withMessage('Price must be a float'),
  body('status').optional().isIn(['Available', 'Closed']).withMessage('Status must be either available or unavailable'),
];


// Middleware to handle validation results
const menuValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateMenu,
  menuValidationResult,
  validateEditMenu
};
