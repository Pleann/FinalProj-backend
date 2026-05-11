const pool = require('../../config/db');
const TripEntity = require('./trip.entity');

class TripDao {
    async insert(trip, ownerId) {
        const { rows } = await pool.query(
            `INSERT INTO trip (trip_name, start_time, end_time, meetup_time, trip_destination, meeting_point, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [
                trip.tripName,
                trip.startTime,
                trip.endTime,
                trip.meetUpTime,
                trip.tripDestination,
                trip.meetingPoint,
                trip.imageUrl || null,
                ownerId,
            ]
        );
        return new TripEntity(rows[0]);
    }
    async findAll() {
        const { rows } = await pool.query(`SELECT * FROM trip`);
        return rows.map(row => new TripEntity(row));
    }
}

module.exports = TripDao;