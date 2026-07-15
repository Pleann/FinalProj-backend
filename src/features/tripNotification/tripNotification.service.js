const tripNotificationDao = require('./tripNotification.dao');

class tripNotificationService {
    constructor() {
        this.dao = new tripNotificationDao();
    }

    async getNotifications(userId) {
        try {
            return await this.dao.findByUser(userId);
        } catch (error) {
            throw new Error(`Failed to fetch notifications for user ${userId}: ${error.message}`);
        }
    }

    // async getUnreadNotifications(userId) {
    //     return this.tripnotificationRepo.findUnreadByUser(userId);
    // }
    //
    // async markAsRead(notificationId) {
    //     return this.tripnotificationRepo.markAsRead(notificationId);
    // }
    //
    // async markAllAsRead(userId) {
    //     return this.tripnotificationRepo.markAllAsRead(userId);
    // }

    async deleteNotification(notificationId) {
        try {
            return await this.dao.delete(notificationId);
        } catch (error) {
            throw new Error(`Failed to delete notification ${notificationId}: ${error.message}`);
        }
    }
}

module.exports = tripNotificationService;