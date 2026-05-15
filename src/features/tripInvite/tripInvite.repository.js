const TripInviteDao = require('./tripInvite.dao');

class TripInviteRepository {
    constructor() {
        this.dao = new TripInviteDao();
    }

    async save(tripId, userId) {
        return this.dao.insert(tripId, userId);
    }

    async findByTrip(tripId) {
        return this.dao.findByTrip(tripId);
    }

    async findById(tripInviteId) {
        return this.dao.findById(tripInviteId);
    }

    async updateStatus(tripInviteId, inviteStatus) {
        return this.dao.updateStatus(tripInviteId, inviteStatus);
    }
}

module.exports = TripInviteRepository;