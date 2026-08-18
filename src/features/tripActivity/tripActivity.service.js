const TripActivityDao = require('./tripActivity.dao');
const sendNotification = require('../../util/sendNotification');

const STOP_RADIUS_M    = 500;
const STOP_MIN_MS      = 5 * 60_000; // 5 minutes in milliseconds
const EARTH_RADIUS_M   = 6_371_000;
const PLACES_API_URL   = 'https://places.googleapis.com/v1/places:searchNearby';

//Review this
const ACTIVITY_TYPE_MAP = {
    restaurant: 'Food',   cafe: 'Food',
    bar:        'Food',   bakery: 'Food',
    museum:         'Sightseeing', art_gallery:      'Sightseeing',
    tourist_attraction: 'Sightseeing', amusement_park: 'Sightseeing',
    lodging:    'Accommodation', hotel: 'Accommodation',
    transit_station: 'Transit', airport: 'Transit', bus_station: 'Transit',
};

function deriveActivityType(googleTypes = []) {
    for (const type of googleTypes) {
        if (ACTIVITY_TYPE_MAP[type]) return ACTIVITY_TYPE_MAP[type];
    }
    return 'Other';
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = deg => (deg * Math.PI) / 180;
    const dLat  = toRad(lat2 - lat1);
    const dLon  = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return EARTH_RADIUS_M * 2 * Math.asin(Math.sqrt(a));
}

class TripActivityService {
    constructor() {
        this.dao = new TripActivityDao();
        this.placesApiKey  = process.env.GOOGLE_PLACES_API_KEY;

        // In-memory tracker for pending stops (not yet confirmed)
        // Structure: { userId_tripId: { stopId, latitude, longitude, enteredAt } }
        this.pendingStops = {};
    }

    async confirmStop(tripId, confirmStopDto) {
        const { userId, latitude, longitude, timestamp } = confirmStopDto;
        const key     = `${userId}_${tripId}`;
        const now     = new Date(timestamp);
        const pending = this.pendingStops[key];

        if (pending) {
            const dist = haversineDistance(
                latitude, longitude,
                pending.latitude, pending.longitude
            );

            if (dist <= STOP_RADIUS_M) {
                const elapsed = now - pending.enteredAt;
                if (elapsed >= STOP_MIN_MS) {
                    // Confirmed — single insert with both entered_at and exited_at
                    const stop = await this.dao.insertStop(tripId, {
                        userId,
                        latitude:  pending.latitude,
                        longitude: pending.longitude,
                        enteredAt: pending.enteredAt,
                        exitedAt:  now,
                    });
                    delete this.pendingStops[key];
                    this.createActivityFromStop(stop).catch(console.error);
                    return stop;
                }
                return null; // still waiting, in-memory only
            } else {
                // Left radius before confirming — discard, no DB row was ever created
                delete this.pendingStops[key];
            }
        }

        // Start tracking a new candidate — in memory only, no DB write yet
        this.pendingStops[key] = { latitude, longitude, enteredAt: now };
        return null;
    }

    async createActivityFromStop(stop) {
        let placeData;
        try {
            placeData = await this.callGooglePlacesAPI(
                parseFloat(stop.latitude),
                parseFloat(stop.longitude)
            );
        } catch (error) {
            throw new Error(`Failed to fetch place data for stop ${stop.stopId}: ${error.message}`);
        }

        const activity = await this.dao.insertActivity(stop.tripId, {
            userId: stop.userId,
            locationName: placeData.locationName,
            locationType: placeData.locationType,
            activityType: deriveActivityType(placeData.types),
            startTime: stop.enteredAt,
            endTime: stop.exitedAt,
        });

        try {
            // Link stop → activity
            await this.dao.linkStopToActivity(stop.stopId, activity.activityId);
        } catch (error) {
            throw new Error(`Failed to link stop ${stop.stopId} to activity ${activity.activityId}: ${error.message}`);
        }

        // await sendNotification(
        //     [stop.userId],
        //     stop.tripId,
        //     'ExpensePrompt',
        //     `You stopped at ${activity.locationName}. Don't forget to log any expenses!`,
        // );

        return activity;
    }

    async getTimeline(tripId) {
        return this.dao.findActivitiesByTrip(tripId);
    }

    async countActivityTypesByTrip(tripId) {
        let numAct;
        try {
            numAct = await this.dao.findActivityTypeFromTrip(tripId);
        } catch (error) {
            throw new Error(`Failed to fetch activity types for trip ${tripId}: ${error.message}`);
        }

        return numAct.reduce((acc, activity) => {
            const type = activity.activityType;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
    }

    //review this
    async callGooglePlacesAPI(latitude, longitude) {
        const response = await fetch(PLACES_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type':     'application/json',
                'X-Goog-Api-Key':   this.placesApiKey,
                'X-Goog-FieldMask': 'places.displayName,places.types',
            },
            body: JSON.stringify({
                includedTypes: [],
                maxResultCount: 1,
                locationRestriction: {
                    circle: {
                        center: { latitude, longitude },
                        radius: 50.0, // tight radius to get the most relevant place
                    },
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Google Places API error: ${response.statusText}`);
        }

        const data  = await response.json();
        const place = data.places?.[0];

        if (!place) throw new Error('No place found at this location');

        return {
            locationName: place.displayName?.text ?? 'Unknown',
            locationType: place.types?.[0]        ?? 'Unknown',
            types:        place.types              ?? [],
        };
    }
}

module.exports = TripActivityService;