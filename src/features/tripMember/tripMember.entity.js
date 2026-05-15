class TripMemberEntity {
    constructor(row) {
        this.participantId = row.participant_id;
        this.tripId        = row.trip_id;
        this.userId        = row.user_id;
        this.memberStatus  = row.member_status;
    }
}

module.exports = TripMemberEntity;