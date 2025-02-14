const { body } = require("express-validator");

const userValidator = {
  signup: [
    body("firstname").notEmpty().withMessage("Firstname is required"),
    body("lastname").notEmpty().withMessage("Lastname is required"),
    body("mobile_no")
      .notEmpty()
      .isNumeric()
      .withMessage("Mobile number must be numeric")
      .isLength({ min: 10, max: 15 })
      .withMessage("Mobile number must be between 10 to 15 digits"),
    body("email").notEmpty().isEmail().withMessage("Valid email is required"),
    body("password")
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],

  login: [
    body("email").notEmpty().isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
};

module.exports = userValidator;
