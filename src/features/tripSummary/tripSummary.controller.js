const TripSummaryService = require('./tripSummary.service');

class TripSummaryController {
    constructor() {
        this.tripSummaryService = new TripSummaryService();
    }

    async savePhoto(req, res) {
        try {
            const { tripId } = req.params;
            // Replace with req.user.userId when JWT authentication is enabled.
            const userId = req.user?.userId || 1;
            const photo = await this.tripSummaryService.savePhoto(tripId, userId, req.file);
            res.status(201).json({
                message: 'Photo added successfully',
                photo,
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async getPhotosByTrip(req, res) {
        try {
            const { tripId } = req.params;
            const photos = await this.tripSummaryService.getPhotosByTrip(tripId);
            res.status(200).json({
                message: 'Photos retrieved successfully',
                photos,
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = TripSummaryController;