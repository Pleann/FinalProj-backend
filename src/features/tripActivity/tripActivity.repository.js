const TripActivityDao = require('./tripActivity.dao');

class TripActivityRepository {
    constructor() {
        this.dao = new TripActivityDao();
    }

    // ── Stop methods ──────────────────────────────────────────────────────────

    async saveStop(tripId, confirmStopDto) {
        return this.dao.insertStop(tripId, confirmStopDto);
    }

    async closeStop(stopId, exitedAt) {
        return this.dao.updateStopExit(stopId, exitedAt);
    }


    async linkStopToActivity(stopId, activityId) {
        return this.dao.linkStopToActivity(stopId, activityId);
    }

    async findStopsByTrip(tripId) {
        return this.dao.findStopsByTrip(tripId);
    }

    async findStopById(stopId) {
        return this.dao.findStopById(stopId);
    }

    // ── Activity methods ──────────────────────────────────────────────────────

    async saveActivity(tripId, saveActivityDto) {
        return this.dao.insertActivity(tripId, saveActivityDto);
    }

    async findActivitiesByTrip(tripId) {
        return this.dao.findActivitiesByTrip(tripId);
    }

    async findActivityById(activityId) {
        return this.dao.findActivityById(activityId);
    }

    //keep for later
    async updateActivity(activityId, fields) {
        return this.dao.updateActivity(activityId, fields);
    }
}

module.exports = TripActivityRepository;