const uploadImage = require('../../util/uploadImage');
const TripSummaryDao = require('./tripSummary.dao');

class TripSummaryService {
    constructor() {
        this.dao = new TripSummaryDao();
    }

    async savePhoto(tripId, userId, file) {
        if (!tripId) throw new Error('Trip ID is required');
        if (!userId) throw new Error('User ID is required');
        if (!file) throw new Error('Photo is required');

        const photoUrl = await uploadImage(file, 'trip-photos');
        return this.dao.insertPhoto(tripId, userId, photoUrl);
    }

    async getPhotosByTrip(tripId) {
        if (!tripId) throw new Error('Trip ID is required');
        return this.dao.getPhotosByTrip(tripId);
    }
}

module.exports = TripSummaryService;