class CreateTripDto {
    constructor(body) {
        if (!body.tripName)        throw new Error('Trip name is required');
        if (!body.startTime)       throw new Error('Start date is required');
        if (!body.endTime)         throw new Error('End date is required');
        if (!body.tripDestination) throw new Error('Trip destination is required');
        if (!body.meetUpTime)      throw new Error('Meet-up time is required');

        const start = new Date(body.startTime);
        const end = new Date(body.endTime);
        if (start > end) throw new Error('Start date must be before end date');

        this.tripName        = body.tripName.trim();
        this.startTime       = body.startTime;
        this.endTime         = body.endTime;
        this.tripDestination = body.tripDestination.trim();
        this.meetingPoint    = body.meetingPoint?.trim() || null;
    }
}

class TripResponseDto {
    constructor(entity) {
        this.tripId          = entity.tripId;
        this.tripName        = entity.tripName;
        this.startTime       = entity.startTime;
        this.endTime         = entity.endTime;
        this.tripDestination = entity.tripDestination;
        this.meetingPoint    = entity.meetingPoint;
        this.imageUrl        = entity.imageUrl;
        this.createdBy       = entity.createdBy;
        this.status          = entity.status;
    }
}

module.exports = { CreateTripDto, TripResponseDto };