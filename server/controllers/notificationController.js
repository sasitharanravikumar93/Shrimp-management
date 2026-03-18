const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const filter = unreadOnly ? { isRead: false } : {};
    if (req.query.pondId) filter.pondId = req.query.pondId;
    
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Internal utility function used by other controllers to create notifications
exports.createNotificationInternal = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Failed to create internal notification:', error);
  }
};
