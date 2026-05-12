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

    async update(tripId, fields) {
        const keys = Object.keys(fields);
        const values = Object.values(fields);

        // Dynamically build SET clause: "trip_name = $1, start_time = $2 ..."
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        values.push(tripId); // last placeholder for WHERE

        const { rows } = await pool.query(
            `UPDATE trip SET ${setClause} WHERE trip_id = $${values.length} RETURNING *`,
            values
        );

        if (rows.length === 0) throw new Error('Trip not found');
        return new TripEntity(rows[0]);
    }
}

module.exports = TripDao;