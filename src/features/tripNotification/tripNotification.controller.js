const tripNotificationService = require('./tripNotification.service');
const { tripNotificationDto } = require('./tripNotification.dto');

class NotificationController {
    constructor() {
        this.tripNotificationService = new tripNotificationService();
    }

    // ── GET /users/:userId/notifications ──────────────────────────────────────
    async getNotifications(req, res) {
        try {
            const { userId } = req.params;
            const notifications = await this.tripNotificationService.getNotifications(userId);
            res.status(200).json(notifications.map(n => new tripNotificationDto(n)));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // ── GET /users/:userId/notifications/unread ───────────────────────────────
    async getUnreadNotifications(req, res) {
        try {
            const { userId } = req.params;
            const notifications = await this.tripNotificationService.getUnreadNotifications(userId);
            res.status(200).json(notifications.map(n => new tripNotificationDto(n)));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // ── PATCH /users/:userId/notifications/:notificationId/read ──────────────
    async markAsRead(req, res) {
        try {
            const { notificationId } = req.params;
            const notification = await this.tripNotificationService.markAsRead(notificationId);
            res.status(200).json({
                message: 'Notification marked as read',
                notification: new tripNotificationDto(notification),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // ── PATCH /users/:userId/notifications/read-all ───────────────────────────
    async markAllAsRead(req, res) {
        try {
            const { userId } = req.params;
            const notifications = await this.tripNotificationService.markAllAsRead(userId);
            res.status(200).json({
                message: 'All notifications marked as read',
                notifications: notifications.map(n => new tripNotificationDto(n)),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // ── DELETE /users/:userId/notifications/:notificationId ──────────────────
    async deleteNotification(req, res) {
        try {
            const { notificationId } = req.params;
            await this.tripNotificationService.deleteNotification(notificationId);
            res.status(200).json({ message: 'Notification deleted successfully' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}

module.exports = NotificationController;