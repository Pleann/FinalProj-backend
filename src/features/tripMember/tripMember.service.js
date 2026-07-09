const TripMemberDao = require('./tripMember.dao');
const pool = require('../../config/db');

class TripMemberService {
    constructor() {
        this.Dao = new TripMemberDao()
    }

    async getMembersByTrip(tripId) {
        if (!tripId) throw new Error('Could not fetch member by tripId')
        return this.Dao.findByTrip(tripId);
    }

    async updateMemberStatus(tripId, participantId, updateTripMemberDto, ownerId) {
        // Only owner can edit, only on Upcoming trips
        const { rows } = await pool.query(
            `SELECT * FROM Trip WHERE trip_id = $1`, [tripId]
        );
        if (rows.length === 0) throw new Error('Trip not found');
        if (rows[0].created_by !== ownerId) throw new Error('Only the trip owner can edit members');
        if (rows[0].trip_status !== 'Upcoming') throw new Error('Can only edit members of Upcoming trips');

        return this.Dao.updateStatus(participantId, updateTripMemberDto.memberStatus);
    }

    async removeMember(tripId, participantId, ownerId) {
        // Only owner can remove, only on Upcoming trips
        const { rows } = await pool.query(
            `SELECT * FROM Trip WHERE trip_id = $1`, [tripId]
        );
        if (rows.length === 0) throw new Error('Trip not found');
        if (rows[0].created_by !== ownerId) throw new Error('Only the trip owner can remove members');
        if (rows[0].trip_status !== 'Upcoming') throw new Error('Can only remove members from Upcoming trips');

        return this.Dao.delete(participantId);
    }
}

module.exports = TripMemberService;