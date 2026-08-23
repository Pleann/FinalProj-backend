class tripPhotoEntity {
    constructor(row) {
        this.photoId = row.photo_id;
        this.tripId = row.trip_id;
        this.userId = row.user_id;
        this.photoUrl = row.photo_url;
        this.description = row.description;
        this.createdAt = row.created_at;
    }
}

class awardEntity {
    constructor(row) {
        this.awardId = row.award_id;
        this.tripId = row.trip_id;
        this.userId = row.user_id;
        this.awardName = row.award_name;
        this.description = row.description;
        this.earnedAt = row.earned_at;
    }
}