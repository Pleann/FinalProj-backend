const TripActivityService = require('./tripActivity.service');
const {
    ConfirmStopDto,
    DetectPlaceTypeDto,
    StopResponseDto,
    ActivityResponseDto,
    DetectPlaceTypeResponseDto,
} = require('./tripActivity.dto');

class TripActivityController {
    constructor() {
        this.activityService = new TripActivityService();
    }

    // ── GET /trips/:tripId/activities/timeline ────────────────────────────────
    async getTimeline(req, res) {
        try {
            const { tripId } = req.params;
            const activities = await this.activityService.getTimeline(tripId);
            res.status(200).json(activities.map(a => new ActivityResponseDto(a)));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = TripActivityController;