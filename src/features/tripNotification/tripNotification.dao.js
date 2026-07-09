const pool                = require('../../config/db');
const tripNotificationEntity  = require('./tripNotification.entity');

class tripNotificationDao {

    async findByUser(userId) {
        const { rows } = await pool.query(
            `SELECT * FROM Notification
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );
        return rows.map(row => new tripNotificationEntity(row));
    }

    // async findUnreadByUser(userId) {
    //     const { rows } = await pool.query(
    //         `SELECT * FROM Notification
    //          WHERE user_id = $1 AND is_read = FALSE
    //          ORDER BY created_at DESC`,
    //         [userId]
    //     );
    //     return rows.map(row => new tripNotificationEntity(row));
    // }
    //
    // async markAsRead(notificationId) {
    //     const { rows } = await pool.query(
    //         `UPDATE Notification SET is_read = TRUE WHERE notification_id = $1 RETURNING *`,
    //         [notificationId]
    //     );
    //     if (rows.length === 0) throw new Error('Notification not found');
    //     return new tripNotificationEntity(rows[0]);
    // }
    //
    // async markAllAsRead(userId) {
    //     const { rows } = await pool.query(
    //         `UPDATE Notification SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE RETURNING *`,
    //         [userId]
    //     );
    //     return rows.map(row => new tripNotificationEntity(row));
    // }

    async delete(notificationId) {
        const { rows } = await pool.query(
            `DELETE FROM Notification WHERE notification_id = $1 RETURNING *`,
            [notificationId]
        );
        if (rows.length === 0) throw new Error('Notification not found');
        return new tripNotificationEntity(rows[0]);
    }
}

module.exports = tripNotificationDao;