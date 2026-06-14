class ActivityEntity {
    constructor(row) {
        this.activityId    = row.activity_id;
        this.tripId        = row.trip_id;
        this.userId        = row.user_id;
        this.locationName  = row.location_name;
        this.locationType  = row.location_type;
        this.activityType  = row.activity_type;
        this.startTime     = row.ac_start_time;
        this.endTime       = row.ac_end_time;
        this.duration      = row.ac_end_time && row.ac_start_time
            ? Math.round((new Date(row.ac_end_time) - new Date(row.ac_start_time)) / 60_000)
            : null; // duration in minutes
    }
}

class StopEntity {
    constructor(row) {
        this.stopId      = row.stop_id;
        this.tripId      = row.trip_id;
        this.userId      = row.user_id;
        this.latitude    = row.latitude;
        this.longitude   = row.longitude;
        this.enteredAt   = row.entered_at;
        this.exitedAt    = row.exited_at;
        this.activityId  = row.activity_id; // null until enriched by Google Places
    }
}

module.exports = { ActivityEntity, StopEntity };