class TripMemberEntity {
    constructor(row) {
        this.participantId = row.participant_id;
        this.tripId        = row.trip_id;
        this.userId        = row.user_id;
        this.memberStatus  = row.member_status;
        this.attendance    = row.attendance;

        this.username = row.username;
        this.reliabilityScore = row.reliability_score;
        this.profilePicture = row.profile_picture_url;
    }
}

module.exports = TripMemberEntity;