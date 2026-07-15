class tripNotificationDto {
    constructor(notification) {
        this.notificationId = notification.notificationId;
        this.userId          = notification.userId;
        this.tripId           = notification.tripId;
        this.title           = notification.title;
        this.message          = notification.message;
        this.referenceId     = notification.reference_id;
        this.isRead            = notification.isRead;
        this.createdAt        = notification.createdAt;
    }
}

class TripNotificationResponseDto {
    constructor(notification) {
        this.notificationId = notification.notificationId;
        this.userId         = notification.userId;
        this.tripId          = notification.tripId;
        this.title           = notification.title;
        this.message          = notification.message;
        this.referenceId     = notification.referenceId;
        this.isRead          = notification.isRead;
        this.createdAt       = notification.createdAt;
    }
}

module.exports = { tripNotificationDto, TripNotificationResponseDto };