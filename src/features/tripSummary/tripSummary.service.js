const uploadImage = require('../../util/uploadImage');
const TripSummaryDao = require('./tripSummary.dao');
const TripDao = require('../trip/trip.dao');

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

function getActivitiesByType(summary, type) {
    return summary.activities.filter(a => a.activity_type === type);
}

function uniqueLocationNames(activities) {
    return new Set(activities.map(a => a.location_name)).size;
}

function uniqueLocationTypes(activities) {
    return new Set(activities.map(a => a.location_type)).size;
}

function totalDuration(activities) {
    return activities.reduce((sum, a) =>
        sum + (new Date(a.ac_end_time) - new Date(a.ac_start_time)), 0);
}

function maxSingleDuration(activities) {
    return activities.reduce((max, a) => {
        const dur = new Date(a.ac_end_time) - new Date(a.ac_start_time);
        return dur > max ? dur : max;
    }, 0);
}

function sortedStartTimes(activities) {
    return activities
        .map(a => new Date(a.ac_start_time))
        .sort((a, b) => a - b);
}

function firstActivityStart(summary) {
    const times = sortedStartTimes(summary.activities);
    return times.length ? times[0] : null;
}

function gapBetweenFirstTwo(summary) {
    const times = sortedStartTimes(summary.activities);
    if (times.length < 2) return 0;
    return times[1] - times[0];
}

function averageGapBetweenConsecutive(activities) {
    const times = sortedStartTimes(activities);
    if (times.length < 2) return Infinity; // fewer than 2 => can't be "back-to-back" winner
    let totalGap = 0;
    for (let i = 1; i < times.length; i++) {
        totalGap += times[i] - times[i - 1];
    }
    return totalGap / (times.length - 1);
}

function countActivitiesBeforeCutoff(activities, cutoffHour) {
    return activities.filter(a => new Date(a.ac_start_time).getHours() < cutoffHour).length;
}

function countActivitiesWithinFirstDay(summary, tripStart) {
    if (!tripStart) return 0;
    const dayOne = new Date(tripStart);
    dayOne.setDate(dayOne.getDate() + 1);
    return summary.activities.filter(a => {
        const start = new Date(a.ac_start_time);
        return start >= tripStart && start < dayOne;
    }).length;
}

function countLastMinuteActivities(activities) {
    // activity started within 15 min of its own scheduled window closing
    return activities.filter(a => {
        const start = new Date(a.ac_start_time);
        const end = new Date(a.ac_end_time);
        const diffMinutes = (end - start) / (1000 * 60);
        return diffMinutes > 0 && diffMinutes <= 15;
    }).length;
}

function maxDistanceForSummary(summary) {
    return getMaxDistanceFromStart(summary.stops);
}

function pickWinner(summaries, scoreFn) {
    const scored = summaries.map(s => ({ summary: s, score: scoreFn(s) }));
    return scored.reduce((max, s) => s.score > max.score ? s : max);
}

function buildAward(tripId, summary, awardName, awardDesc) {
    return {
        tripId,
        userId: summary.member[0].user_id,
        awardName,
        awardDesc
    };
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
        this.tripDao = new TripDao();
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

    async deletePhoto(photoId) {
        if (!photoId) throw new Error('Photo ID is required');
        return this.dao.deletePhoto(photoId);
    }

    evaluateAwards(tripId, summaries, tripStart) {
        const awards = [];

        // ---- lateArrival ----
        const lateTurtle = pickWinner(summaries, s => {
            const t = firstActivityStart(s);
            return t ? t.getTime() : -Infinity;
        });
        awards.push(buildAward(tripId, lateTurtle.summary, 'Late Turtle', 'is the last one to join the adventure!'));

        const tripEarliestStart = summaries.reduce((min, s) => {
            const t = firstActivityStart(s);
            return t && (min === null || t < min) ? t : min;
        }, null);
        const fashionablyLate = pickWinner(summaries, s => {
            const t = firstActivityStart(s);
            if (!t || !tripEarliestStart) return -Infinity;
            return (t - tripEarliestStart) > (60 * 60 * 1000) ? (t - tripEarliestStart) : -Infinity;
        });
        awards.push(buildAward(tripId, fashionablyLate.summary, 'Fashionably Late', 'made everyone wait for the grand entrance!'));

        const lastMinuteLegend = pickWinner(summaries, s => countLastMinuteActivities(s.activities));
        awards.push(buildAward(tripId, lastMinuteLegend.summary, 'Last Minute Legend', 'arrived just in time for the adventure!'));

        const slowAndSteady = pickWinner(summaries, s => gapBetweenFirstTwo(s));
        awards.push(buildAward(tripId, slowAndSteady.summary, 'Slow & Steady', 'took the scenic route to the meeting point!'));

        // ---- earlyArrival ----
        const earlyBird = pickWinner(summaries, s => {
            const t = firstActivityStart(s);
            return t ? -t.getTime() : -Infinity; // earliest => highest score
        });
        awards.push(buildAward(tripId, earlyBird.summary, 'Early Bird', 'was ready before everyone else!'));

        const firstOnScene = pickWinner(summaries, s => {
            const t = firstActivityStart(s);
            if (!t || !tripStart) return -Infinity;
            return t < tripStart ? (tripStart - t) : -Infinity;
        });
        awards.push(buildAward(tripId, firstOnScene.summary, 'First on the Scene', 'beat everyone to the meeting point!'));

        const readySetRoam = pickWinner(summaries, s => countActivitiesWithinFirstDay(s, tripStart));
        awards.push(buildAward(tripId, readySetRoam.summary, 'Ready, Set, Roam!', 'was prepared before the adventure even began!'));

        const morningHero = pickWinner(summaries, s => countActivitiesBeforeCutoff(s.activities, 8));
        awards.push(buildAward(tripId, morningHero.summary, 'Morning Hero', 'showed up bright and early!'));

        // ---- food ----
        const snackCommander = pickWinner(summaries, s => getActivitiesByType(s, 'food').length);
        awards.push(buildAward(tripId, snackCommander.summary, 'Snack Commander', 'never missed a food stop!'));

        const foodieSupreme = pickWinner(summaries, s => uniqueLocationNames(getActivitiesByType(s, 'food')));
        awards.push(buildAward(tripId, foodieSupreme.summary, 'Foodie Supreme', 'turned this trip into a tasting tour!'));

        const biteBoss = pickWinner(summaries, s => {
            const gap = averageGapBetweenConsecutive(getActivitiesByType(s, 'food'));
            return gap === Infinity ? -Infinity : -gap; // smallest gap => highest score
        });
        awards.push(buildAward(tripId, biteBoss.summary, 'Bite Boss', 'was always ready for the next bite!'));

        const tasteExplorer = pickWinner(summaries, s => uniqueLocationTypes(getActivitiesByType(s, 'food')));
        awards.push(buildAward(tripId, tasteExplorer.summary, 'Taste Explorer', 'explored the trip one dish at a time!'));

        // ---- sightseeing ----
        const explorerMode = pickWinner(summaries, s => getActivitiesByType(s, 'sightseeing').length);
        awards.push(buildAward(tripId, explorerMode.summary, 'Explorer Mode', 'was always finding the next place!'));

        const viewHunter = pickWinner(summaries, s => uniqueLocationNames(getActivitiesByType(s, 'sightseeing')));
        awards.push(buildAward(tripId, viewHunter.summary, 'View Hunter', 'never let a good view go unnoticed!'));

        const sightseeingStar = pickWinner(summaries, s => totalDuration(getActivitiesByType(s, 'sightseeing')));
        awards.push(buildAward(tripId, sightseeingStar.summary, 'Sightseeing Star', 'made every stop worth exploring!'));

        const adventureMagnet = pickWinner(summaries, s => uniqueLocationTypes(getActivitiesByType(s, 'sightseeing')));
        awards.push(buildAward(tripId, adventureMagnet.summary, 'Adventure Magnet', 'was always drawn to the next adventure!'));

        // ---- accommodation ----
        const cozyCommander = pickWinner(summaries, s => getActivitiesByType(s, 'accommodation').length);
        awards.push(buildAward(tripId, cozyCommander.summary, 'Cozy Commander', 'knew exactly when it was time to recharge!'));

        const restMaster = pickWinner(summaries, s => totalDuration(getActivitiesByType(s, 'accommodation')));
        awards.push(buildAward(tripId, restMaster.summary, 'Rest Master', 'made relaxation part of the adventure!'));

        const chillChampion = pickWinner(summaries, s => maxSingleDuration(getActivitiesByType(s, 'accommodation')));
        awards.push(buildAward(tripId, chillChampion.summary, 'Chill Champion', 'always found time to slow things down!'));

        const rechargePro = pickWinner(summaries, s => uniqueLocationNames(getActivitiesByType(s, 'accommodation')));
        awards.push(buildAward(tripId, rechargePro.summary, 'Recharge Pro', 'never underestimated the power of a good rest!'));

        // ---- transit ----
        const roadWarrior = pickWinner(summaries, s => getActivitiesByType(s, 'transit').length);
        awards.push(buildAward(tripId, roadWarrior.summary, 'Road Warrior', 'kept the adventure moving!'));

        const alwaysOnTheMove = pickWinner(summaries, s => uniqueLocationTypes(getActivitiesByType(s, 'transit')));
        awards.push(buildAward(tripId, alwaysOnTheMove.summary, 'Always on the Move', 'was never in one place for long!'));

        const bornToRoam = pickWinner(summaries, s => maxDistanceForSummary(s));
        awards.push(buildAward(tripId, bornToRoam.summary, 'Born to Roam', 'really put the roam in RoamiO!'));

        const transitTitan = pickWinner(summaries, s => totalDuration(getActivitiesByType(s, 'transit')));
        awards.push(buildAward(tripId, transitTitan.summary, 'Transit Titan', 'spent the trip going places!'));

        return awards;
    }

    async setAwards(tripId) {
        if (!tripId) throw new Error('Trip ID is required');
        const flat = await this.dao.getSummaryByTrip(tripId);
        const summaries = groupSummariesByUser(flat);

        const trip = await this.tripDao.findById(tripId); // or wherever trip start time lives
        const tripStart = trip.startTime; // adjust field name to match your schema

        const awards = this.evaluateAwards(tripId, summaries, tripStart);
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