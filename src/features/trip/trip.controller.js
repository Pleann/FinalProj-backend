const TripService = require('./trip.service');
const { CreateTripDto, TripResponseDto } = require('./trip.dto');

class TripController {
    constructor() {
        this.tripService = new TripService();
    }

    async createTrip(req, res) {
        try {
            const dto = new CreateTripDto(req.body);
            // ownerId will come from JWT later — hardcoded for now
            const ownerId = 1;
            const trip = await this.tripService.createTrip(dto, ownerId, req.file);
            res.status(201).json({
                message: 'Trip created successfully',
                trip: new TripResponseDto(trip),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async getAllTrips(req, res) {
        try {
            const trips = await this.tripService.getAllTrips();
            res.status(200).json(trips.map(trip => new TripResponseDto(trip)));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async updateTrip(req, res) {
        try {
            const { tripId } = req.params;
            const trip = await this.tripService.updateTrip(tripId, req.body, req.file);
            res.status(200).json({
                message: 'Trip updated successfully',
                trip: new TripResponseDto(trip),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async updateTripStatus(req, res) {
        try {
            const { tripId } = req.params;
            const { status } = req.body;
            if (!status) throw new Error ('status is required');
            const trip = await this.tripService.updateTripStatus(tripId, status);
            res.status(200).json({
                message: 'Trip status updated successfully',
                trip: new TripResponseDto(trip),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async deleteTrip(req, res) {
        try {
            const { tripId } = req.params;
            await this.tripService.deleteTrip(tripId);
            res.status(200).json({ message: 'Trip deleted successfully' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}

module.exports = TripController;