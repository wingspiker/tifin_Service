const express = require('express');
const app = express();
const adminRoutes = require('./routes/adminRoutes');
const deliveryBoyRoutes = require('./routes/deliveryBoyRoutes');
const userRoutes = require('./routes/userRoutes');
require('./config/index');  // Initialize database connection
require('./config/db');

// Middlewares
app.use(express.json());

// routes
app.use('/api/admin', adminRoutes);
app.use('/api/deliveryboy', deliveryBoyRoutes);
app.use('/api/user', userRoutes);

module.exports = app;
