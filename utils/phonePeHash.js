const crypto = require('crypto');
require('dotenv').config();

exports.generateHash = (body) => {
  const saltKey = process.env.PHONEPE_SALT_KEY;
  return crypto.createHmac('sha256', saltKey).update(body).digest('base64');
};