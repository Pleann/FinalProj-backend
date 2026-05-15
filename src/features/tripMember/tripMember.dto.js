class UpdateTripMemberDto {
    constructor(body) {
        const valid = ['Participating', 'Not_participating', 'Cancelled'];
        if (!body.memberStatus) throw new Error('Member status is required');
        if (!valid.includes(body.memberStatus)) {
            throw new Error('Invalid status. Must be Participating, Not_participating or Cancelled');
        }
        this.memberStatus = body.memberStatus;
    }
}

class TripMemberResponseDto {
    constructor(entity) {
        this.participantId = entity.participantId;
        this.tripId        = entity.tripId;
        this.userId        = entity.userId;
        this.memberStatus  = entity.memberStatus;
    }
}

module.exports = { UpdateTripMemberDto, TripMemberResponseDto };