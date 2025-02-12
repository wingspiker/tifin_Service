const axios = require('axios');

class TelegramService {
    constructor(botToken, chatId) {
        this.botToken = botToken;
        this.chatId = chatId;
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    }

    async sendOrderNotification(order) {
        const message = `📦 Order #${order.id} has been placed successfully!
        🕒 deliveryDate: ${order.deliveryDate}
        📦 Shift: ${order.shift}
        📱 Mobile Number: ${order.mobile_no}
        📍 Address: ${order.note}
        📨 Status: ${order.status}
        📨 payment_status: ${order.payment_status}
        `
        ;

        try {
            const response = await axios.post(this.apiUrl, {
                chat_id: this.chatId,
                text: message,
            });
            console.log('Notification sent:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error sending notification:', error.response?.data || error.message);
            // throw new Error('Failed to send Telegram notification');
        }
    }
}

module.exports = TelegramService;