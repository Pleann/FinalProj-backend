const LocationDao = require('./tripLocation.dao');

class LocationRepository {
    constructor() {
        this.dao = new LocationDao();
    }

    async save(tripId, userId, latitude, longitude, timestamp) {
        return this.dao.save(tripId, userId, latitude, longitude, timestamp);
    }

    //keep for latrer
    async findByTrip(tripId) {
        return this.dao.findByTrip(tripId);
    }

    async findByUser(userId, tripId) {
        return this.dao.findByUser(userId, tripId);
    }

    async findLatestPerMember(tripId) {
        return this.dao.findLatestPerMember(tripId);
    }

    async findTripById(tripId) {
        return this.dao.findTripById(tripId);
    }

    async activateTrip(tripId) {
        return this.dao.activateTrip(tripId);
    }

    async findTripMembers(tripId) {
        return this.dao.findTripMembers(tripId);
    }

    async updateAttendance(tripId, userId, attendance) {
        return this.dao.updateAttendance(tripId, userId, attendance);
    }

    async findAttendanceByTrip(tripId) {
        return this.dao.findAttendanceByTrip(tripId);
    }
}

module.exports = LocationRepository;