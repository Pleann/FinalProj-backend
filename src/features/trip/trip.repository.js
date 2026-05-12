const TripDao = require('./trip.dao');

class TripRepository {
    constructor() {
        this.dao = new TripDao();
    }

    async save(tripDto, ownerId) {
        return this.dao.insert(tripDto, ownerId);
    }

    async findAll() {
        return this.dao.findAll();
    }

    async update(tripId, fields) {
        return this.dao.update(tripId, fields);
    }
}

module.exports = TripRepository;