const uploadImage = require('../../util/uploadImage');
const TripDao = require("./trip.dao");

class TripService {
    constructor() {
        this.dao = new TripDao();
    }

    async createTrip(createTripDto, ownerId, file) {
        if (!createTripDto) throw new Error('Could not create trip')
        if (file) {
            createTripDto.imageUrl = await uploadImage(file);
        }
        return this.dao.insert(createTripDto, ownerId);
    }

    // async getAllTrips() {
    //     const trips = await this.tripRepo.findAll();
    //     if (!trips) throw new Error('Could not find all trips');
    //     return trips;
    // }

    async getTripById(tripId) {
        const trips = await this.dao.findById(tripId);
        if (!trips) throw new Error('Could not find trip ID');
        return trips;
    }

    async getUpcomingTrips() {
        const trips = await this.dao.findByStatus('Upcoming');
        if (!trips) throw new Error('Could not find upcoming trips');
        return trips;
    }

    async getActiveTrips() {
        const trips = await this.dao.findByStatus('Active');
        if (!trips) throw new Error('Could not find Active trips');
        return trips;
    }

    async getCompletedTrips() {
        const trips = await this.dao.findByStatus('Completed');
        if (!trips) throw new Error('Could not find completed trips');
        return trips;
    }

    async updateTrip(tripId, body, file) {
        const fields = {};

        if (body.tripName)        fields.trip_name        = body.tripName.trim();
        if (body.startDate)       fields.start_date       = body.startTime;
        if (body.endDate)         fields.end_date         = body.endTime;
        if (body.tripDestination) fields.trip_destination = body.tripDestination.trim();
        if (body.meetingPointName)    fields.meeting_point_name    = body.meetingPointName.trim();
        if (body.meetingPointLat)     fields.meeting_point_lat     = body.meetingPointLat;
        if (body.meetingPointLon)     fields.meeting_point_lon     = body.meetingPointLon;
        if (body.startTime)      fields.start_time        = body.startTime;

        // Validate dates only if both are provide
        if (fields.start_date && fields.end_date) {
            if (new Date(fields.start_date) > new Date(fields.end_date)) {
                throw new Error('Start date must be before end date');
            }
        }

        if (file) {
            fields.image_url = await uploadImage(file);
        }

        if (Object.keys(fields).length === 0) {
            throw new Error('No fields provided to update');
        }

        return this.dao.update(tripId, fields);
    }

    async updateTripStatus(tripId, status) {
        const validStatuses = ['Upcoming', 'Active', 'Completed'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status. Must be Upcoming, Active or Completed');
        }
        return this.dao.update(tripId, { trip_status: status });
    }

    async deleteTrip(tripId) {
        if (!tripId) throw new Error('Could not find trip ID')
        return this.dao.delete(tripId);
    }
}

module.exports = TripService;