const uploadImage = require('../../util/uploadImage');
const TripSummaryDao = require('./tripSummary.dao');

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function getMaxDistanceFromStart(stops) {
    if (stops.length < 2) return 0;
    const start = stops[0];
    return Math.max(...stops.slice(1).map(stop =>
        calculateDistance(start.latitude, start.longitude, stop.latitude, stop.longitude)
    ));
}

function groupSummariesByUser(flat) {
    const { members, activities, awards, stops, photos } = flat;

    return members.map(member => {
        const userId = member.user_id;
        return {
            member: [member],
            activities: activities.filter(a => a.user_id === userId),
            awards: awards.filter(a => a.user_id === userId),
            stops: stops.filter(s => s.user_id === userId),
            photos: photos.filter(p => p.user_id === userId),
        };
    });
}

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

    evaluateAwards(summaries) {
        const awards = [];

        // Most Active — most activities attended
        const mostActive = summaries.reduce((max, s) =>
            s.activities.length > max.activities.length ? s : max
        );
        awards.push({ userId: mostActive.member[0].user_id, awardName: 'Most Active', awardDesc: 'Attended the most activities on the trip' });

        // Marathoner — most total activity duration
        const withDuration = summaries.map(s => ({
            ...s,
            totalDuration: s.activities.reduce((sum, a) =>
                sum + (new Date(a.ac_end_time) - new Date(a.ac_start_time)), 0)
        }));
        const marathoner = withDuration.reduce((max, s) => s.totalDuration > max.totalDuration ? s : max);
        awards.push({ userId: marathoner.member[0].user_id, awardName: 'Marathoner', awardDesc: 'Spent the most total time in activities' });

        // Most Places Visited — most unique location_name
        const withPlaces = summaries.map(s => ({
            ...s,
            uniquePlaces: new Set(s.activities.map(a => a.location_name)).size
        }));
        const mostPlaces = withPlaces.reduce((max, s) => s.uniquePlaces > max.uniquePlaces ? s : max);
        awards.push({ userId: mostPlaces.member[0].user_id, awardName: 'Most Places Visited', awardDesc: 'Visited the most unique locations' });

        const withMaxDistance = summaries.map(s => ({
            ...s,
            maxDistance: getMaxDistanceFromStart(s.stops)
        }));
        const furthest = withMaxDistance.reduce((max, s) =>
            s.maxDistance > max.maxDistance ? s : max
        );
        awards.push({
            userId: furthest.member[0].user_id,
            awardName: 'Furthest Traveled',
            awardDesc: 'Traveled the furthest distance from the trip start'
        });

        // Most Photos — most photo uploads
        const mostPhotos = summaries.reduce((max, s) =>
            s.photos.length > max.photos.length ? s : max
        );
        awards.push({
            userId: mostPhotos.member[0].user_id,
            awardName: 'Most Photos',
            awardDesc: 'Uploaded the most photos on the trip'
        });

        return awards;
    }

    async setAwards(tripId) {
        if (!tripId) throw new Error('Trip ID is required');
        const flat = await this.dao.getSummaryByTrip(tripId);
        const summaries = groupSummariesByUser(flat);
        const awards = this.evaluateAwards(summaries);
        return Promise.all(
            awards.map(a => this.dao.setAward(tripId, a.userId, a.awardName, a.awardDesc))
        );
    }

    async getAwardsByTrip(tripId) {
        if (!tripId) throw new Error('Trip ID is required');
        return this.dao.getAwardsByTrip(tripId);
    }

    async getSummaryByTrip(tripId) {
        if (!tripId) throw new Error('Trip ID is required');
        return this.dao.getSummaryByTrip(tripId);
    }

    async getActivityGraphData(tripId, userId) {
        if (!tripId) throw new Error('Trip ID is required');
        if (!userId) throw new Error('User ID is required');

        const activityTypeCounts = await this.dao.getActivityTypeCounts(tripId, userId);

        return {
            totalActivityTypes: activityTypeCounts.length,
            activityTypeCounts
        };
    }

    async getStoryData(tripId, userId) {
        if (!tripId) throw new Error('Trip ID is required');
        if (!userId) throw new Error('User ID is required');

        await this.setAwards(tripId);

        const [summary, photos, awards, activityTypeCounts] = await Promise.all([
            this.dao.getSummaryByTrip(tripId),
            this.dao.getPhotosByTrip(tripId),
            this.dao.getAwardsByTrip(tripId),
            this.dao.getActivityTypeCounts(tripId, userId)
        ]);

        return {
            ...summary,
            photos,
            awards,
            activityTypeCounts
        };
    }
}

module.exports = TripSummaryService;