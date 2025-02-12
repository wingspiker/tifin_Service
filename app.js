const express = require('express');
const app = express();
const adminRoutes = require('./routes/adminRoutes');
const deliveryBoyRoutes = require('./routes/deliveryBoyRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require("path");
const cors = require('cors');
const { sendEmail } = require('./controllers/emailController');
require('./config/index');  // Initialize database connection
require('./config/db');

app.use(cors())
// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// routes
app.get('/hello', (req, res) => {
    res.status(200).json({ message: 'Hello Welcome to the server'});
});
app.use('/api/admin', adminRoutes);
app.use('/api/deliveryboy', deliveryBoyRoutes);
app.use('/api/user', userRoutes);
app.use('/api/send-email', sendEmail);

module.exports = app;
