const pool               = require('../../config/db');
const TripLocationEntity = require('./tripLocation.entity');

class LocationDao {

    async save(tripId, saveLocationDto) {
        const { rows } = await pool.query(
            `INSERT INTO Location (trip_id, user_id, latitude, longitude, location_timestamp)
             VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
            [tripId, saveLocationDto.userId, saveLocationDto.latitude, saveLocationDto.longitude, saveLocationDto.locationTimestamp]
        );
        return new TripLocationEntity(rows[0]);
    }

    async findDueTrips(status, beforeTime) {
        const { rows } = await pool.query(
            `SELECT trip_id, trip_name, start_time, meetup_time, meeting_point, trip_status
         FROM   Trip
         WHERE  trip_status = $1 AND meetup_time <= $2`,
            [status, beforeTime]
        );
        return rows;
    }

    async findByTrip(tripId) {
        const { rows } = await pool.query(
            `SELECT * FROM Location WHERE trip_id = $1 ORDER BY location_timestamp ASC`,
            [tripId]
        );
        return rows.map(row => new TripLocationEntity(row));
    }

    async findByUser(userId, tripId) {
        const { rows } = await pool.query(
            `SELECT * FROM Location
             WHERE trip_id = $1 AND user_id = $2
             ORDER BY location_timestamp ASC`,
            [tripId, userId]
        );
        return rows.map(row => new TripLocationEntity(row));
    }

    async findTripsForAttendanceCheck(beforeTime) {
        const { rows } = await pool.query(
            `SELECT trip_id, trip_name, meetup_time, meeting_point, trip_status
         FROM   Trip
         WHERE  trip_status IN ('Upcoming', 'Active')
           AND  meetup_time <= $1`,
            [beforeTime]
        );
        return rows;
    }

    //review this soon
    async findLatestPerMember(tripId) {
        const { rows } = await pool.query(
            `SELECT DISTINCT ON (l.user_id)
              l.user_id,
              a.first_name,
              a.last_name,
              l.latitude,
              l.longitude,
              l.location_timestamp
       FROM   Location l
       JOIN   Account  a ON a.user_id = l.user_id
       WHERE  l.trip_id = $1
       ORDER  BY l.user_id, l.location_timestamp DESC`,
            [tripId]
        );
        return rows;
    }

    //why
    async findTripById(tripId) {
        const { rows } = await pool.query(
            `SELECT trip_id, trip_name, start_time, meetup_time, meeting_point, trip_status
             FROM   Trip
             WHERE  trip_id = $1`,
            [tripId]
        );
        return rows[0] ?? null;
    }

    //no need updateTripStatus in trip.service does this
    async activateTrip(tripId) {
        const { rows } = await pool.query(
            `UPDATE Trip SET trip_status = 'Active' WHERE trip_id = $1 RETURNING *`,
            [tripId]
        );
        if (rows.length === 0) throw new Error('Trip not found');
        return rows[0];
    }

    //member layer already has this
    async findTripMembers(tripId) {
        const { rows } = await pool.query(
            `SELECT tm.user_id, tm.attendance, a.first_name, a.last_name
             FROM   TripMember tm
                        JOIN   Account    a ON a.user_id = tm.user_id
             WHERE  tm.trip_id = $1
               AND  tm.member_status = 'Participating'`,
            [tripId]
        );
        return rows;
    }

    //why here and not memberLayer
    async updateAttendance(tripId, userId, attendance) {
        const { rows } = await pool.query(
            `UPDATE TripMember
             SET    attendance = $3
             WHERE  trip_id = $1 AND user_id = $2
                 RETURNING *`,
            [tripId, userId, attendance]
        );
        if (rows.length === 0) throw new Error('TripMember not found');
        return rows[0];
    }
}

module.exports = LocationDao;