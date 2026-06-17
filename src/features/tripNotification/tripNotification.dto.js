class tripNotificationDto {
    constructor(notification) {
        this.notificationId = notification.notificationId;
        this.userId          = notification.userId;
        this.tripId           = notification.tripId;
        this.type             = notification.type;
        this.message          = notification.message;
        this.isRead            = notification.isRead;
        this.createdAt        = notification.createdAt;
    }
}

module.exports = { tripNotificationDto };