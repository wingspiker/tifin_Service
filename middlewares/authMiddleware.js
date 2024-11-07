const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get Bearer token.
  let token = req.headers['authorization'];
  token = token.split(' ')[1];

  if (!token) return res.status(403).json({ error: 'Token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token'});
 }
};