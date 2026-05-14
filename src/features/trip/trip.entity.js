class TripEntity {
    constructor(row) {
        this.tripId = row.trip_id;
        this.tripName = row.trip_name;
        this.startTime = row.start_time;
        this.endTime = row.end_time;
        this.meetUpTime = row.meetup_time;
        this.tripDestination = row.trip_destination;
        this.meetingPoint = row.meeting_point;
        this.imageUrl = row.image_url;
        this.tripStatus = row.trip_status;
        this.createdBy = row.created_by;
    }
}

module.exports = TripEntity;