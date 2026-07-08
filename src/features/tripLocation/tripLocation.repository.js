const LocationDao = require('./tripLocation.dao');

class LocationRepository {
    constructor() {
        this.dao = new LocationDao();
    }

    async save(tripId, saveLocationDto) {
        return this.dao.save(tripId, saveLocationDto);
    }

    async findDueTrips(status, beforeTime) {
        return this.dao.findDueTrips(status, beforeTime);
    }

    async findByUser(userId, tripId) {
        return this.dao.findByUser(userId, tripId);
    }

    async findTripsForAttendanceCheck(beforeTime) {
        return this.dao.findTripsForAttendanceCheck(beforeTime);
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
}

module.exports = LocationRepository;