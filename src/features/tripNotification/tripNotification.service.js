const tripNotificationRepository = require('./tripNotification.repository');

class tripNotificationService {
    constructor() {
        this.tripnotificationRepo = new tripNotificationRepository();
    }

    async getNotifications(userId) {
        return this.tripnotificationRepo.findByUser(userId);
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
        return this.tripnotificationRepo.delete(notificationId);
    }
}

module.exports = tripNotificationService;