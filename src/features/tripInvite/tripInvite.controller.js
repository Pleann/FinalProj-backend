const TripInviteService = require('./tripInvite.service');
const { CreateTripInviteDto, UpdateTripInviteDto, TripInviteResponseDto } = require('./tripInvite.dto');

class TripInviteController {
    constructor() {
        this.tripInviteService = new TripInviteService();
    }

    async sendInvite(req, res) {
        try {
            const { tripId } = req.params;
            const ownerId = 1; // from JWT later
            const dto = new CreateTripInviteDto(req.body);
            const invite = await this.tripInviteService.sendInvite(tripId, dto, ownerId);
            res.status(201).json({
                message: 'Invite sent successfully',
                invite: new TripInviteResponseDto(invite),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async getInvitesByTrip(req, res) {
        try {
            const { tripId } = req.params;
            const invites = await this.tripInviteService.getInvitesByTrip(tripId);
            res.status(200).json(invites.map(invite => new TripInviteResponseDto(invite)));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async respondToInvite(req, res) {
        try {
            const { tripInviteId } = req.params;
            const dto = new UpdateTripInviteDto(req.body);
            const invite = await this.tripInviteService.respondToInvite(tripInviteId, dto);
            res.status(200).json({
                message: 'Invite updated successfully',
                invite: new TripInviteResponseDto(invite),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}

module.exports = TripInviteController;