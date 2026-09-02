class TripPhotoEntity {
    constructor(row) {
        this.photoId = row.photo_id;
        this.tripId = row.trip_id;
        this.userId = row.user_id;
        this.photoUrl = row.photo_url;
        this.uploadedAt = row.uploaded_at;
    }
}

class TripAwardEntity {
    constructor(row) {
        this.awardId = row.award_id;
        this.tripId = row.trip_id;
        this.userId = row.user_id;
        this.awardName = row.award_name;
        this.awardDesc = row.award_description;
        this.awardedAt = row.awarded_at;
    }
}
module.exports = { TripPhotoEntity, TripAwardEntity };