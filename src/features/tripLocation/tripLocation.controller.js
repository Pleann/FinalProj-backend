const LocationService = require('./tripLocation.service');
const {
    SaveLocationDto,
    LocationResponseDto,
    LatestLocationResponseDto,
} = require('./tripLocation.dto');

class LocationController {
    constructor() {
        this.locationService = new LocationService();
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
}

module.exports = LocationController;