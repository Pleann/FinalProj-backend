const pool = require('../../config/db');
const TripMemberEntity = require('./tripMember.entity');

class TripMemberDao {
    async findByTrip(tripId) {
        const { rows } = await pool.query(
            `SELECT * FROM TripMember WHERE trip_id = $1`,
            [tripId]
        );
        return rows.map(row => new TripMemberEntity(row));
    }

    async insert(tripId, userId, memberStatus = 'Participating') {
        const { rows } = await pool.query(
            `INSERT INTO TripMember (trip_id, user_id, member_status)
         VALUES ($1, $2, $3)
         ON CONFLICT (trip_id, user_id) DO NOTHING
         RETURNING *`,
            [tripId, userId, memberStatus]
        );
        return rows[0] ? new TripMemberEntity(rows[0]) : null;
    }

    async findUserByParticipantId(participantId) {
        const { rows } = await pool.query(
            `SELECT a.*
             FROM   TripMember tm
                        JOIN   Account    a ON a.user_id = tm.user_id
             WHERE  tm.participant_id = $1`,
            [participantId]
        );
        if (rows.length === 0) throw new Error('Participant not found');
        return rows[0];
    }
    //might no longer use
    // async findById(participantId) {
    //     const { rows } = await pool.query(
    //         `SELECT * FROM TripMember WHERE participant_id = $1`,
    //         [participantId]
    //     );
    //     if (rows.length === 0) throw new Error('Member not found');
    //     return new TripMemberEntity(rows[0]);
    // }

    async updateStatus(participantId, memberStatus) {
        const { rows } = await pool.query(
            `UPDATE TripMember SET member_status = $1 WHERE participant_id = $2 RETURNING *`,
            [memberStatus, participantId]
        );
        if (rows.length === 0) throw new Error('Member not found');
        return new TripMemberEntity(rows[0]);
    }

    async delete(participantId) {
        const { rows } = await pool.query(
            `DELETE FROM TripMember WHERE participant_id = $1 RETURNING *`,
            [participantId]
        );
        if (rows.length === 0) throw new Error('Member not found');
        return new TripMemberEntity(rows[0]);
    }
}

module.exports = TripMemberDao;