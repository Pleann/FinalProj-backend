const TripRepository = require('./trip.repository');
const uploadImage = require('../../util/uploadImage');

class TripService {
    constructor() {
        this.tripRepo = new TripRepository();
    }

    async createTrip(createTripDto, ownerId, file) {
        if (!createTripDto) throw new Error('Could not create trip')
        if (file) {
            createTripDto.imageUrl = await uploadImage(file);
        }
        return this.tripRepo.save(createTripDto, ownerId);
    }

    // async getAllTrips() {
    //     const trips = await this.tripRepo.findAll();
    //     if (!trips) throw new Error('Could not find all trips');
    //     return trips;
    // }

    async getUpcomingTrips() {
        const trips = await this.tripRepo.findUpcoming();
        if (!trips) throw new Error('Could not find upcoming trips');
        return trips;
    }

    async getActiveTrips() {
        const trips = await this.tripRepo.findActive();
        if (!trips) throw new Error('Could not find Active trips');
        return trips;
    }

    async getCompletedTrips() {
        const trips = await this.tripRepo.findCompleted();
        if (!trips) throw new Error('Could not find completed trips');
        return trips;
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

    async updateTripStatus(tripId, status) {
        const validStatuses = ['Upcoming', 'Active', 'Completed'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status. Must be Upcoming, Active or Completed');
        }
        return this.tripRepo.update(tripId, { trip_status: status });
    }

    async deleteTrip(tripId) {
        if (!tripId) throw new Error('Could not find trip ID')
        return this.tripRepo.delete(tripId);
    }
}

module.exports = TripService;