class SaveLocationDto {
    constructor({ user_id, latitude, longitude, location_timestamp }) {
        if (!user_id)   throw new Error('user_id is required');
        if (latitude  === undefined || latitude  === null) throw new Error('latitude is required');
        if (longitude === undefined || longitude === null) throw new Error('longitude is required');

        this.user_id            = user_id;
        this.latitude           = parseFloat(latitude);
        this.longitude          = parseFloat(longitude);
        this.location_timestamp = location_timestamp ? new Date(location_timestamp) : new Date();
    }
}

class LocationResponseDto {
    constructor(location) {
        this.locationId = location.locationId;
        this.tripId     = location.tripId;
        this.userId     = location.userId;
        this.latitude   = location.latitude;
        this.longitude  = location.longitude;
        this.timestamp  = location.timestamp;
    }
}

class LatestLocationResponseDto {
    constructor({ user_id, first_name, last_name, latitude, longitude, location_timestamp }) {
        this.userId    = user_id;
        this.firstName = first_name;
        this.lastName  = last_name;
        this.latitude  = latitude;
        this.longitude = longitude;
        this.timestamp = location_timestamp;
    }
}

class AttendanceResponseDto {
    constructor({ user_id, first_name, last_name, attendance }) {
        this.userId     = user_id;
        this.firstName  = first_name;
        this.lastName   = last_name;
        this.attendance = attendance;
    }
}

class TripStartResponseDto {
    constructor(trip) {
        this.tripId      = trip.trip_id;
        this.tripName    = trip.trip_name;
        this.startDate   = trip.start_date;
        this.startTime  = trip.start_time;
        this.meetingPoint = trip.meeting_point;
        this.tripStatus  = trip.trip_status;
    }
}

module.exports = {
    SaveLocationDto,
    LocationResponseDto,
    LatestLocationResponseDto,
    AttendanceResponseDto,
    TripStartResponseDto,
};