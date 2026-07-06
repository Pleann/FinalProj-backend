const tripNotificationDao = require('./tripNotification.dao');

class tripNotificationRepository {
    constructor() {
        this.dao = new tripNotificationDao();
    }

    async findByUser(userId) {
        return this.dao.findByUser(userId);
    }

    async findUnreadByUser(userId) {
        return this.dao.findUnreadByUser(userId);
    }

    async markAsRead(notificationId) {
        return this.dao.markAsRead(notificationId);
    }

    async markAllAsRead(userId) {
        return this.dao.markAllAsRead(userId);
    }

    async delete(notificationId) {
        return this.dao.delete(notificationId);
    }
}

module.exports = tripNotificationRepository;