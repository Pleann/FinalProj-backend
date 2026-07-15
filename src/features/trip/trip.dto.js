class CreateTripDto {
    constructor(body) {
        if (!body.tripName)        throw new Error('Trip name is required');
        if (!body.startDate)       throw new Error('Start date is required');
        if (!body.endDate)         throw new Error('End date is required');
        if (!body.tripDestination) throw new Error('Trip destination is required');
        if (!body.startTime)       throw new Error('Meet-up time is required');

        const start = new Date(body.startDate);
        const end = new Date(body.endDate);
        if (start > end) throw new Error('Start date must be before end date');

        this.tripName        = body.tripName.trim();
        this.startDate       = body.startDate;
        this.endDate         = body.endDate;
        this.startTime       = body.startTime;
        this.tripDestination = body.tripDestination.trim();
        this.meetingPointName  = body.meetingPointName?.trim() || null;
        this.meetingPointLat   = body.meetingPointLat != null ? parseFloat(body.meetingPointLat) : null;
        this.meetingPointLon   = body.meetingPointLon != null ? parseFloat(body.meetingPointLon) : null;
    }
}

class TripResponseDto {
    constructor(entity) {
        this.tripId          = entity.tripId;
        this.tripName        = entity.tripName;
        this.startDate       = entity.startDate;
        this.endDate         = entity.endDate;
        this.startTime        = entity.startTime;
        this.tripDestination = entity.tripDestination;
        this.meetingPointName  = entity.meetingPointName;
        this.meetingPointLat   = entity.meetingPointLat;
        this.meetingPointLon   = entity.meetingPointLon;
        this.imageUrl        = entity.imageUrl;
        this.tripStatus      = entity.tripStatus;
        this.createdBy       = entity.createdBy;
    }
}

module.exports = { CreateTripDto, TripResponseDto };