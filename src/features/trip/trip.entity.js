class TripEntity {
    constructor(row) {
        this.tripId = row.trip_id;
        this.tripName = row.trip_name;
        this.startDate = row.start_date;
        this.endDate = row.end_date;
        this.startTime = row.start_time;
        this.tripDestination = row.trip_destination;
        this.meetingPointName = row.meeting_point_name;
        this.meetingPointLat = row.meeting_point_lat;
        this.meetingPointLon = row.meeting_point_lon;
        this.imageUrl = row.image_url;
        this.tripStatus = row.trip_status;
        this.createdBy = row.created_by;
    }
}

module.exports = TripEntity;