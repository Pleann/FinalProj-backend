const pool = require('../config/db');

const VALID_TYPES = ['TripStarted', 'ExpensePrompt'];

const sendNotification = async (userIds, tripId, type, message) => {
    if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new Error('userIds must be a non-empty array');
    }
    if (!VALID_TYPES.includes(type)) {
        throw new Error(`Invalid notification type. Must be one of: ${VALID_TYPES.join(', ')}`);
    }
    if (!message) throw new Error('message is required');

    // Build a single multi-row INSERT for efficiency
    const values       = [];
    const placeholders = userIds.map((userId, i) => {
        const offset = i * 4;
        values.push(userId, tripId, type, message);
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
    });

    const { rows } = await pool.query(
        `INSERT INTO Notification (user_id, trip_id, type, message)
         VALUES ${placeholders.join(', ')}
         RETURNING *`,
        values
    );

    return rows;
};

module.exports = sendNotification;