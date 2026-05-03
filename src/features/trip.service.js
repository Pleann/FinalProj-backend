const TripRepository = require('./trip.repository');
const uploadImage = require('../../util/uploadImage');

class TripService {
    constructor() {
        this.tripRepo = new TripRepository();
    }

    async createTrip(createTripDto, ownerId) {
        if (file) {
            createTripDto.imageUrl = await uploadImage(file);
        }
        return this.tripRepo.save(createTripDto, ownerId);
    }

    async getAllTrips() {
        return this.tripRepo.findAll();
    }
}

module.exports = TripService;