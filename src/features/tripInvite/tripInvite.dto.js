class CreateTripInviteDto {
    constructor(body) {
        if (!body.userId) throw new Error('User ID is required');
        this.userId = body.userId;
    }
}

class UpdateTripInviteDto {
    constructor(body) {
        const valid = ['Accept', 'Reject', 'Cancelled'];
        if (!body.inviteStatus) throw new Error('Invite status is required');
        if (!valid.includes(body.inviteStatus)) {
            throw new Error('Invalid status. Must be Accept, Reject or Cancelled');
        }
        this.inviteStatus = body.inviteStatus;
    }
}

class TripInviteResponseDto {
    constructor(entity) {
        this.tripInviteId = entity.tripInviteId;
        this.tripId       = entity.tripId;
        this.userId       = entity.userId;
        this.inviteStatus = entity.inviteStatus;
    }
}

module.exports = { CreateTripInviteDto, UpdateTripInviteDto, TripInviteResponseDto };