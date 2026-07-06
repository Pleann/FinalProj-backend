const pool = require('../../config/db');
const { ActivityEntity, StopEntity } = require('./tripActivity.entity');

class TripActivityDao {

    async insertStop(tripId, confirmStopDto) {
        const { rows } = await pool.query(
            `INSERT INTO Stop (trip_id, user_id, latitude, longitude, entered_at)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [tripId, confirmStopDto]
        );
        return new StopEntity(rows[0]);
    }

    async updateStopExit(stopId, exitedAt) {
        const { rows } = await pool.query(
            `UPDATE Stop SET exited_at = $2 WHERE stop_id = $1 RETURNING *`,
            [stopId, exitedAt]
        );
        if (rows.length === 0) throw new Error('Stop not found');
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

    async findStopsByTrip(tripId) {
        const { rows } = await pool.query(
            `SELECT * FROM Stop WHERE trip_id = $1 ORDER BY entered_at ASC`,
            [tripId]
        );
        return rows.map(row => new StopEntity(row));
    }

    async findStopById(stopId) {
        const { rows } = await pool.query(
            `SELECT * FROM Stop WHERE stop_id = $1`,
            [stopId]
        );
        return rows.length ? new StopEntity(rows[0]) : null;
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

    async findActivityById(activityId) {
        const { rows } = await pool.query(
            `SELECT * FROM Activity WHERE activity_id = $1`,
            [activityId]
        );
        return rows.length ? new ActivityEntity(rows[0]) : null;
    }

    async updateActivity(activityId, fields) {
        const keys   = Object.keys(fields);
        const values = Object.values(fields);
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        values.push(activityId);
        const { rows } = await pool.query(
            `UPDATE Activity SET ${setClause} WHERE activity_id = $${values.length} RETURNING *`,
            values
        );
        if (rows.length === 0) throw new Error('Activity not found');
        return new ActivityEntity(rows[0]);
    }
}

module.exports = TripActivityDao;