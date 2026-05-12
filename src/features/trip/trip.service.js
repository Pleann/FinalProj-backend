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

    async updateTrip(tripId, body, file) {
        const fields = {};

        if (body.tripName)        fields.trip_name        = body.tripName.trim();
        if (body.startTime)       fields.start_time       = body.startTime;
        if (body.endTime)         fields.end_time         = body.endTime;
        if (body.tripDestination) fields.trip_destination = body.tripDestination.trim();
        if (body.meetingPoint)    fields.meeting_point    = body.meetingPoint.trim();
        if (body.meetUpTime)      fields.meetup_time      = body.meetUpTime;

        // Validate dates only if both are provided
        if (fields.start_time && fields.end_time) {
            if (new Date(fields.start_time) > new Date(fields.end_time)) {
                throw new Error('Start date must be before end date');
            }
        }

        if (file) {
            fields.image_url = await uploadImage(file);
        }

        if (Object.keys(fields).length === 0) {
            throw new Error('No fields provided to update');
        }

        return this.tripRepo.update(tripId, fields);
    }

    async deleteTrip(tripId) {
        return this.tripRepo.delete(tripId);
    }
}

module.exports = TripService;