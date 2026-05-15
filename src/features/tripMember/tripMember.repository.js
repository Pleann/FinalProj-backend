const TripMemberDao = require('./tripMember.dao');

class TripMemberRepository {
    constructor() {
        this.dao = new TripMemberDao();
    }

    async findByTrip(tripId) {
        return this.dao.findByTrip(tripId);
    }

    async findById(participantId) {
        return this.dao.findById(participantId);
    }

    async updateStatus(participantId, memberStatus) {
        return this.dao.updateStatus(participantId, memberStatus);
    }

    async delete(participantId) {
        return this.dao.delete(participantId);
    }
}

module.exports = TripMemberRepository;