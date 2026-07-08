class ConfirmStopDto {
    constructor({ userId, latitude, longitude, timestamp }) {
        if (!userId)    throw new Error('userId is required');
        if (latitude === undefined || latitude === null)  throw new Error('latitude is required');
        if (longitude === undefined || longitude === null) throw new Error('longitude is required');

        this.userId    = userId;
        this.latitude  = parseFloat(latitude);
        this.longitude = parseFloat(longitude);
        this.timestamp = timestamp ? new Date(timestamp) : new Date();
    }
}

class DetectPlaceTypeDto {
    constructor({ latitude, longitude }) {
        if (!latitude)  throw new Error('latitude is required');
        if (!longitude) throw new Error('longitude is required');

        this.latitude  = parseFloat(latitude);
        this.longitude = parseFloat(longitude);
    }
}

class StopResponseDto {
    constructor(stop) {
        this.stopId     = stop.stopId;
        this.tripId     = stop.tripId;
        this.userId     = stop.userId;
        this.latitude   = stop.latitude;
        this.longitude  = stop.longitude;
        this.enteredAt  = stop.enteredAt;
        this.exitedAt   = stop.exitedAt;
        this.activityId = stop.activityId;
    }
}

class ActivityResponseDto {
    constructor(activity) {
        this.activityId   = activity.activityId;
        this.tripId       = activity.tripId;
        this.userId       = activity.userId;
        this.locationName = activity.locationName;
        this.locationType = activity.locationType;
        this.activityType = activity.activityType;
        this.startTime    = activity.startTime;
        this.endTime      = activity.endTime;
        this.duration     = activity.duration;
    }
}

class DetectPlaceTypeResponseDto {
    constructor({ locationName, locationType, types }) {
        this.locationName = locationName;
        this.locationType = locationType;
        this.types        = types;
    }
}

module.exports = {
    ConfirmStopDto,
    DetectPlaceTypeDto,
    StopResponseDto,
    ActivityResponseDto,
    DetectPlaceTypeResponseDto,
};