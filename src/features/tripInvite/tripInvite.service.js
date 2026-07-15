const TripInviteDao = require('./tripInvite.dao');
const sendNotification = require('../../util/sendNotification');
const pool = require('../../config/db');

class TripInviteService {
    constructor() {
        this.dao = new TripInviteDao();
    }

    async sendInvite(tripId, createTripInviteDto, ownerId) {
        const { rows } = await pool.query(
            `SELECT * FROM Trip WHERE trip_id = $1`, [tripId]
        );
        if (rows.length === 0) throw new Error('Trip not found');
        if (rows[0].created_by !== ownerId) throw new Error('Only the trip owner can send invites');
        if (rows[0].trip_status !== 'Upcoming') throw new Error('Can only invite members to Upcoming trips');

        const invite = await this.dao.insert(tripId, createTripInviteDto.userId);

        await sendNotification(
            [createTripInviteDto.userId],
            tripId,
            'TripInvite',
            `You've been invited to "${rows[0].trip_name}"`,
            invite.tripInviteId,
        );

        return invite;
    }

    async getInvitesByTrip(tripId) {
        if (!tripId) throw new Error('Could not fetch invite by tripId')
        return this.dao.findByTrip(tripId);
    }

    async respondToInvite(tripInviteId, updateTripInviteDto) {
        const invite = await this.dao.findById(tripInviteId);

        // If accepted, add to TripMember
        if (updateTripInviteDto.inviteStatus === 'Accept') {
            await pool.query(
                `INSERT INTO TripMember (trip_id, user_id, member_status)
         VALUES ($1, $2, 'Participating')
         ON CONFLICT (trip_id, user_id) DO NOTHING`,
                [invite.tripId, invite.userId]
            );
        }

        return this.dao.updateStatus(tripInviteId, updateTripInviteDto.inviteStatus);
    }
}

module.exports = TripInviteService;