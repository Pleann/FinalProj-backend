const pool = require('../../config/db');
const { TripPhotoEntity } = require('./tripSummary.entity');
const { TripAwardEntity } = require('./tripSummary.entity');
const { TripEntity } = require('../trip/trip.entity');
const { TripMemberEntity } = require('../tripMember/tripMember.entity');
const { ActivityEntity } = require('../tripActivity/tripActivity.entity');
const { StopEntity } = require('../tripActivity/tripActivity.entity');

class TripSummaryDao {
    async insertPhoto(tripId, userId, photoUrl) {
        const { rows } = await pool.query(
            `INSERT INTO TripPhoto (trip_id, user_id, photo_url)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [tripId, userId, photoUrl]
        );

        return new TripPhotoEntity(rows[0]);
    }

    async getPhotosByTrip(tripId) {
        const { rows } = await pool.query(
            `SELECT * FROM TripPhoto WHERE trip_id = $1`,
            [tripId]
        );

        return rows.map(row => new TripPhotoEntity(row));
    }

    async deletePhoto(photoId) {
        const { rows } = await pool.query(
            `DELETE FROM TripPhoto WHERE photo_id = $1 RETURNING *`,
            [photoId]
        );

        if (rows.length === 0) {
            throw new Error(`Photo with ID ${photoId} not found`);
        }

        return new TripPhotoEntity(rows[0]);
    }

    async setAward(tripId, userId, awardName, awardDesc) {
        const { rows } = await pool.query(
            `INSERT INTO Award (trip_id, user_id, award_name, award_description)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [tripId, userId, awardName, awardDesc]
        );

        return new TripAwardEntity(rows[0]);
    }

    async getAwardsByTrip(tripId) {
        const { rows } = await pool.query(
            `SELECT *
             FROM Award
             WHERE trip_id = $1`,
            [tripId]
        );

        return rows.map(row => new TripAwardEntity(row));
    }

    async getSummaryByTrip(tripId) {
        const { rows: tripRows } = await pool.query(
            `SELECT trip_id, trip_name, trip_destination FROM Trip WHERE trip_id = $1`,
            [tripId]
        );
        const { rows: memberRows } = await pool.query(
            `SELECT participant_id, user_id, attendance FROM TripMember WHERE trip_id = $1`,
            [tripId]
        );
        const { rows: activityRows } = await pool.query(
            `SELECT activity_id, location_name, location_type, activity_type, ac_start_time, ac_end_time FROM TripActivity WHERE trip_id = $1`,
            [tripId]
        );
        const { rows: awardRows } = await pool.query(
            `SELECT award_id, user_id, award_name, award_description FROM TripAward WHERE trip_id = $1`,
            [tripId]
        );
        const { rows: stopRows } = await pool.query(
            `SELECT stop_id, latitude, longitude, entered_at, exited_at FROM Stop WHERE trip_id = $1 ORDER BY entered_at ASC`,
            [tripId]
        );
        const { rows: photoRows } = await pool.query(
            `SELECT photo_id, photo_url, uploaded_at FROM Photo WHERE trip_id = $1`,
            [tripId]
        );

        return {
            trips: tripRows.map(row => new TripEntity(row)),
            members: memberRows.map(row => new TripMemberEntity(row)),
            activities: activityRows.map(row => new ActivityEntity(row)),
            awards: awardRows.map(row => new TripAwardEntity(row)),
            stops: stopRows.map(row => new StopEntity(row)),
            photos: photoRows.map(row => new TripPhotoEntity(row))
        };
    }

    //check the need for this
    // async getSummarybyUser(tripId, userId) {
    //     const { rows: tripRows } = await pool.query(
    //         `SELECT trip_id, trip_name, trip_destination FROM Trip WHERE trip_id = $1`,
    //         [tripId]
    //     );
    //     const { rows: memberRows } = await pool.query(
    //         `SELECT participant_id, user_id, attendance FROM TripMember WHERE trip_id = $1 AND user_id = $2`,
    //         [tripId, userId]
    //     );
    //     const { rows: activityRows } = await pool.query(
    //         `SELECT activity_id, location_name, location_type, activity_type, ac_start_time, ac_end_time FROM TripActivity WHERE trip_id = $1 AND user_id = $2`,
    //         [tripId, userId]
    //     );
    //     const { rows: awardRows } = await pool.query(
    //         `SELECT award_id, user_id, award_name, award_description FROM TripAward WHERE trip_id = $1 AND user_id = $2`,
    //         [tripId, userId]
    //     );
    //     const { rows: stopRows } = await pool.query(
    //         `SELECT stop_id, latitude, longitude, entered_at, exited_at FROM Stop WHERE trip_id = $1 AND user_id = $2 ORDER BY entered_at ASC`,
    //         [tripId, userId]
    //     );
    //     const { rows: photoRows } = await pool.query(
    //         `SELECT photo_id, photo_url, uploaded_at FROM Photo WHERE trip_id = $1 AND user_id = $2`,
    //         [tripId, userId]
    //     );
    //     return {
    //         trip: tripRows.map(row => new TripEntity(row)),
    //         member: memberRows.map(row => new TripMemberEntity(row)),
    //         activities: activityRows.map(row => new ActivityEntity(row)),
    //         awards: awardRows.map(row => new TripAwardEntity(row)),
    //         stops: stopRows.map(row => new StopEntity(row)),
    //         photos: photoRows.map(row => new TripPhotoEntity(row))
    //     };
    // }

    async getActivityTypeCounts(tripId, userId) {
        const { rows } = await pool.query(
            `SELECT activity_type, COUNT(*) AS count FROM TripActivity WHERE trip_id = $1 AND user_id = $2
             GROUP BY activity_type`,
            [tripId, userId]
        );
        return rows.map(row => ({
            activityType: row.activity_type,
            count: parseInt(row.count, 10)
        }));
    }
}

module.exports = TripSummaryDao;