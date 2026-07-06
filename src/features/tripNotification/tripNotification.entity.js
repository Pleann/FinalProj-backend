class tripNotificationEntity {
    constructor(row) {
        this.notificationId = row.notification_id;
        this.userId          = row.user_id;
        this.tripId           = row.trip_id;
        this.type             = row.type;
        this.message          = row.message;
        this.isRead            = row.is_read;
        this.createdAt        = row.created_at;
    }
}

module.exports = tripNotificationEntity;