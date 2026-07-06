const LocationService = require('./tripLocation.service');
const {
    SaveLocationDto,
    LocationResponseDto,
    LatestLocationResponseDto,
    AttendanceResponseDto,
    TripStartResponseDto,
} = require('./tripLocation.dto');

class LocationController {
    constructor() {
        this.locationService = new LocationService();
    }

    // ── POST /trips/:tripId/location/start ─────────────────────────────────────
    async confirmStart(req, res) {
        try {
            const { tripId } = req.params;
            const trip = await this.locationService.confirmStart(tripId);
            res.status(200).json({
                message: 'Trip activated successfully',
                trip: new TripStartResponseDto(trip),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // ── GET /trips/:tripId/location/start ──────────────────────────────────────
    async getStart(req, res) {
        try {
            const { tripId } = req.params;
            const trip = await this.locationService.getStart(tripId);
            res.status(200).json(new TripStartResponseDto(trip));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // ── POST /trips/:tripId/location ───────────────────────────────────────────
    async saveLocation(req, res) {
        try {
            const { tripId } = req.params;
            const dto = new SaveLocationDto(req.body);
            const location = await this.locationService.saveLocation(tripId, dto);
            res.status(201).json({
                message: 'Location saved successfully',
                location: new LocationResponseDto(location),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // ── GET /trips/:tripId/location/latest ─────────────────────────────────────
    async getLatestLocations(req, res) {
        try {
            const { tripId } = req.params;
            const locations = await this.locationService.getLatestLocations(tripId);
            res.status(200).json(locations.map(l => new LatestLocationResponseDto(l)));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async evaluateAttendance(req, res) {
        try {
            const { tripId } = req.params;
            const results = await this.locationService.evaluateAttendance(tripId);
            res.status(200).json({
                message: 'Attendance evaluated successfully',
                attendance: results.map(r => new AttendanceResponseDto(r)),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // ── GET /trips/:tripId/location/attendance ────────────────────────────────
    async getAttendance(req, res) {
        try {
            const { tripId } = req.params;
            const results = await this.locationService.getAttendance(tripId);
            res.status(200).json(results.map(r => new AttendanceResponseDto(r)));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}

module.exports = LocationController;