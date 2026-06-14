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

    // ── POST /trips/:tripId/activities/stops ──────────────────────────────────
    async confirmStop(req, res) {
        try {
            const { tripId } = req.params;
            const dto        = new ConfirmStopDto(req.body);
            const stop       = await this.activityService.confirmStop(
                tripId, dto.userId, dto.latitude, dto.longitude, dto.timestamp,
            );

            if (!stop) {
                return res.status(202).json({ message: 'Stop tracking in progress' });
            }

            res.status(201).json({
                message: 'Stop confirmed',
                stop: new StopResponseDto(stop),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // ── GET /trips/:tripId/activities/stops ───────────────────────────────────
    async getStops(req, res) {
        try {
            const { tripId } = req.params;
            const stops      = await this.activityService.getStops(tripId);
            res.status(200).json(stops.map(s => new StopResponseDto(s)));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // ── GET /trips/:tripId/activities/stops/:stopId ───────────────────────────
    async getActivityByStop(req, res) {
        try {
            const { stopId } = req.params;
            const activity   = await this.activityService.getActivityByStop(stopId);
            res.status(200).json(new ActivityResponseDto(activity));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // ── POST /trips/:tripId/activities/detect-place ───────────────────────────
    async detectPlaceType(req, res) {
        try {
            const dto    = new DetectPlaceTypeDto(req.body);
            const result = await this.activityService.detectPlaceType(
                dto.latitude, dto.longitude,
            );
            res.status(200).json(new DetectPlaceTypeResponseDto(result));
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // ── POST /trips/:tripId/activities/stops/:stopId/enrich ───────────────────
    async createActivityFromStop(req, res) {
        try {
            const { stopId } = req.params;
            const stop       = await this.activityService.activityRepo.findStopById(stopId);
            if (!stop) throw new Error('Stop not found');

            const activity = await this.activityService.createActivityFromStop(stop);
            res.status(201).json({
                message: 'Activity created from stop',
                activity: new ActivityResponseDto(activity),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
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