const TripInviteRepository = require('./tripInvite.repository');
const pool = require('../../config/db');

class TripInviteService {
    constructor() {
        this.inviteRepo = new TripInviteRepository();
    }

    async sendInvite(tripId, createTripInviteDto, ownerId) {
        // Verify trip exists and requester is the owner
        const { rows } = await pool.query(
            `SELECT * FROM Trip WHERE trip_id = $1`, [tripId]
        );
        if (rows.length === 0) throw new Error('Trip not found');
        if (rows[0].created_by !== ownerId) throw new Error('Only the trip owner can send invites');
        if (rows[0].trip_status !== 'Upcoming') throw new Error('Can only invite members to Upcoming trips');

        return this.inviteRepo.save(tripId, createTripInviteDto.userId);
    }

    async getInvitesByTrip(tripId) {
        return this.inviteRepo.findByTrip(tripId);
    }

    async respondToInvite(tripInviteId, updateTripInviteDto) {
        const invite = await this.inviteRepo.findById(tripInviteId);

        // If accepted, add to TripMember
        if (updateTripInviteDto.inviteStatus === 'Accept') {
            await pool.query(
                `INSERT INTO TripMember (trip_id, user_id, member_status)
         VALUES ($1, $2, 'Participating')
         ON CONFLICT (trip_id, user_id) DO NOTHING`,
                [invite.tripId, invite.userId]
            );
        }

        return this.inviteRepo.updateStatus(tripInviteId, updateTripInviteDto.inviteStatus);
    }
}

module.exports = TripInviteService;