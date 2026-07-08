const pool = require('../../config/db');
const { ActivityEntity, StopEntity } = require('./tripActivity.entity');

class TripActivityDao {

    async insertStop(tripId, stopData) {
        const { rows } = await pool.query(
            `INSERT INTO Stop (trip_id, user_id, latitude, longitude, entered_at, exited_at)
             VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
            [tripId, stopData.userId, stopData.latitude, stopData.longitude, stopData.enteredAt, stopData.exitedAt]
        );
        return new StopEntity(rows[0]);
    }

    async linkStopToActivity(stopId, activityId) {
        const { rows } = await pool.query(
            `UPDATE Stop SET activity_id = $2 WHERE stop_id = $1 RETURNING *`,
            [stopId, activityId]
        );
        if (rows.length === 0) throw new Error('Stop not found');
        return new StopEntity(rows[0]);
    }

    async insertActivity(tripId, saveActivityDto) {
        const { rows } = await pool.query(
            `INSERT INTO Activity (trip_id, user_id, location_name, location_type, activity_type, ac_start_time, ac_end_time)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [tripId, saveActivityDto.userId, saveActivityDto.locationName, saveActivityDto.locationType, saveActivityDto.activityType, saveActivityDto.startTime, saveActivityDto.endTime]
        );
        return new ActivityEntity(rows[0]);
    }

    async findActivitiesByTrip(tripId) {
        const { rows } = await pool.query(
            `SELECT * FROM Activity WHERE trip_id = $1 ORDER BY ac_start_time ASC`,
            [tripId]
        );
        return rows.map(row => new ActivityEntity(row));
    }
}

module.exports = TripActivityDao;