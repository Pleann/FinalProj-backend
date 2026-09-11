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

    async deletePhoto(req, res) {
        try {
            const { photoId } = req.params;
            await this.tripSummaryService.deletePhoto(photoId);
            res.status(200).json({
                message: 'Photo deleted successfully',
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getAwardsByTrip(req, res) {
        try {
            const {tripId} = req.params;
            const awards = await this.tripSummaryService.getAwardsByTrip(tripId);
            res.status(200).json({
                message: 'Awards retrieved successfully',
                awards,
            });
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    }

    async getSummaryByTrip(req, res) {
        try {
            const { tripId } = req.params;
            const summary = await this.tripSummaryService.getSummaryByTrip(tripId);
            res.status(200).json({
                message: 'Summary retrieved successfully',
                summary,
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getActivityGraphDataByTrip(req, res) {
        try {
            const { tripId } = req.params;
            const graphData = await this.tripSummaryService.getActivityGraphDataByTrip(tripId);
            res.status(200).json({
                message: 'Activity graph data retrieved successfully',
                graphData,
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getActivityGraphDataByUser(req, res) {
        try {
            const { tripId, userId } = req.params;
            const graphData = await this.tripSummaryService.getActivityGraphDataByUser(tripId, userId);
            res.status(200).json({
                message: 'Activity graph data retrieved successfully',
                graphData,
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getStoryData(req, res) {
        try {
            const {tripId, userId} = req.params;
            const storyData = await this.tripSummaryService.getStoryData(tripId, userId);
            res.status(200).json({
                message: 'Story data retrieved successfully',
                storyData,
            });
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    }
}

module.exports = TripSummaryController;