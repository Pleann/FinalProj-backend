const pool = require('../../config/db');
const TripInviteEntity = require('./tripInvite.entity');

class TripInviteDao {
    async insert(tripId, userId) {
        const { rows } = await pool.query(
            `INSERT INTO TripInvite (trip_id, user_id, invite_status)
       VALUES ($1, $2, 'Accept')
       RETURNING *`,
            [tripId, userId]
        );
        return new TripInviteEntity(rows[0]);
    }

    async findByTrip(tripId) {
        const { rows } = await pool.query(
            `SELECT * FROM TripInvite WHERE trip_id = $1`,
            [tripId]
        );
        return rows.map(row => new TripInviteEntity(row));
    }

    async findById(tripInviteId) {
        const { rows } = await pool.query(
            `SELECT * FROM TripInvite WHERE trip_invite_id = $1`,
            [tripInviteId]
        );
        if (rows.length === 0) throw new Error('Invite not found');
        return new TripInviteEntity(rows[0]);
    }

    async updateStatus(tripInviteId, inviteStatus) {
        const { rows } = await pool.query(
            `UPDATE TripInvite SET invite_status = $1 WHERE trip_invite_id = $2 RETURNING *`,
            [inviteStatus, tripInviteId]
        );
        if (rows.length === 0) throw new Error('Invite not found');
        return new TripInviteEntity(rows[0]);
    }
}

module.exports = TripInviteDao;