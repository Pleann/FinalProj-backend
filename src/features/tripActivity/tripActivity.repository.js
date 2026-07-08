const TripActivityDao = require('./tripActivity.dao');

class TripActivityRepository {
    constructor() {
        this.dao = new TripActivityDao();
    }

    // ── Stop methods ──────────────────────────────────────────────────────────

    async saveStop(tripId, stopData) {
        return this.dao.insertStop(tripId, stopData);
    }

    async linkStopToActivity(stopId, activityId) {
        return this.dao.linkStopToActivity(stopId, activityId);
    }

    // ── Activity methods ──────────────────────────────────────────────────────

    async saveActivity(tripId, saveActivityDto) {
        return this.dao.insertActivity(tripId, saveActivityDto);
    }

    async findActivitiesByTrip(tripId) {
        return this.dao.findActivitiesByTrip(tripId);
    }
}

module.exports = TripActivityRepository;