class TripInviteEntity {
    constructor(row) {
        this.tripInviteId = row.trip_invite_id;
        this.tripId       = row.trip_id;
        this.userId       = row.user_id;
        this.inviteStatus = row.invite_status;
    }
}

module.exports = TripInviteEntity;