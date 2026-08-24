const pool = require('../../config/db');
const { TripPhotoEntity } = require('./tripSummary.entity');

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
}

module.exports = TripSummaryDao;