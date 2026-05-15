const TripMemberService = require('./tripMember.service');
const { UpdateTripMemberDto, TripMemberResponseDto } = require('./tripMember.dto');

class TripMemberController {
    constructor() {
        this.tripMemberService = new TripMemberService();
    }

    async getMembersByTrip(req, res) {
        try {
            const { tripId } = req.params;
            const members = await this.tripMemberService.getMembersByTrip(tripId);
            res.status(200).json(members.map(m => new TripMemberResponseDto(m)));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async updateMemberStatus(req, res) {
        try {
            const { tripId, participantId } = req.params;
            const ownerId = 1; // from JWT later
            const dto = new UpdateTripMemberDto(req.body);
            const member = await this.tripMemberService.updateMemberStatus(tripId, participantId, dto, ownerId);
            res.status(200).json({
                message: 'Member status updated successfully',
                member: new TripMemberResponseDto(member),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async removeMember(req, res) {
        try {
            const { tripId, participantId } = req.params;
            const ownerId = 1; // from JWT later
            await this.tripMemberService.removeMember(tripId, participantId, ownerId);
            res.status(200).json({ message: 'Member removed successfully' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}

module.exports = TripMemberController;