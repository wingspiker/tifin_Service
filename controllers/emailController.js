const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const axios = require('axios');  // Import Axios for Telegram API requests
dotenv.config(); // Load environment variables

// Create the transporter using Zoho SMTP configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Function to send email based on the contact or feedback type
const sendEmail = async (req, res) => {
    const { json, password } = req.body; // Extract JSON and password from request body

    // Validate that JSON and password are provided
    if (!json || !password) {
        return res.status(400).json({ message: 'Missing JSON or password' });
    }

    // Check if the provided password is correct
    if (password !== process.env.API_PASSWORD) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    // Destructure necessary fields from JSON
    const { name, email, phone_no, company_name, message, email_type, rating } = json;

    // Validate all required fields in JSON
    if (!name || !email || !message || !email_type) {
        return res.status(400).json({ message: 'Missing required fields (name, email, phone_no, company_name, message, email_type)' });
    }

    // Define the email content based on email_type
    let emailContent = '';
    if (email_type === 'query') {
        emailContent = `<p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone No:</strong> ${phone_no}</p>
                        <p><strong>Company:</strong> ${company_name}</p>
                        <p><strong>Message:</strong><br>${message}</p>`;
    } else if (email_type === 'feedback') {
        emailContent = `<p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone No:</strong> ${phone_no}</p>
                        <p><strong>Rating:</strong> ${rating} out of 5</p>
                        <p><strong>Message:</strong><br>${message}</p>`;
    } else {
        return res.status(400).json({ message: 'Invalid email_type, must be "contact" or "feedback"' });
    }

    // Define email options
    const mailOptions = {
        from: process.env.SMTP_USER, // Sender's email
        to: process.env.RECIPIENT_EMAIL, // Send email to recipient email
        subject: `${email_type.charAt(0).toUpperCase() + email_type.slice(1)} Message from ${name}`, // Subject
        text: message, // Plain text body
        html: emailContent, // HTML formatted body
    };

    try {
        // Send the email to the recipient
        const info = await transporter.sendMail(mailOptions);

        // You can also send this information to a Telegram bot if desired, using Axios
        // Example of sending a message to Telegram (optional, based on your setup):
        // await axios.post('YOUR_TELEGRAM_API_URL', {
        //     chat_id: process.env.TELEGRAM_CHAT_ID,
        //     text: `New ${email_type} message from ${name}: ${message}`,
        // });

        // Respond with success
        res.status(200).json({ message: 'Email sent successfully', info });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send email', error });
    }
};

module.exports = { sendEmail };
