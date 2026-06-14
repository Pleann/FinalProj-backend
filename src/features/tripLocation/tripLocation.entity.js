class TripLocationEntity {
    constructor(row) {
        this.locationId = row.location_id;
        this.tripId     = row.trip_id;
        this.userId     = row.user_id;
        this.latitude   = row.latitude;
        this.longitude = row.longitude;
        this.locationTimestamp = row.location_timestamp;
    }
}

module.exports = TripLocationEntity;