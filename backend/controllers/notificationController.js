// controllers/notificationController.js
const Notification = require('../models/Notification');

// Get all notifications sorted by creation date in descending order
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch notifications', error });
    }
};


// Add a new notification (optional, if needed)
exports.addNotification = async (req, res) => {
    const { message, isImportant } = req.body;

    try {
        const newNotification = new Notification({
            message,
            isImportant,
        });
        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add notification', error });
    }
};
