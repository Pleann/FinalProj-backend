const tripNotificationDao = require('./tripNotification.dao');

class tripNotificationService {
    constructor() {
        this.dao = new tripNotificationDao();
    }

    async getNotifications(userId) {
        return this.dao.findByUser(userId);
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
        return this.dao.delete(notificationId);
    }
}

module.exports = tripNotificationService;