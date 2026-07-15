const pool = require('../config/db');

const VALID_TITLES = ['TripStarted', 'ExpensePrompt', 'TripInvite'];

const sendNotification = async (userIds, tripId, title, message) => {
    if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new Error('userIds must be a non-empty array');
    }
    if (!VALID_TITLES.includes(title)) {
        throw new Error(`Invalid notification title. Must be one of: ${VALID_TITLES.join(', ')}`);
    }
    if (!message) throw new Error('message is required');

    const values       = [];
    const placeholders = userIds.map((userId, i) => {
        const offset = i * 4;
        values.push(userId, tripId, title, message);
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
    });

    const { rows } = await pool.query(
        `INSERT INTO Notification (user_id, trip_id, title, message)
         VALUES ${placeholders.join(', ')}
             RETURNING *`,
        values
    );
    return rows;
};

module.exports = sendNotification;