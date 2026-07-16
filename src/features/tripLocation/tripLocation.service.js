const sendNotification     = require('../../util/sendNotification');
const ActivityService = require('../tripActivity/tripActivity.service');
const LocationDao = require("./tripLocation.dao");
const MemberDao = require("../tripMember/tripMember.dao")


const EARTH_RADIUS_M     = 6_371_000;
const VICINITY_RADIUS_M  = 500;
const MAJORITY_THRESHOLD = 3 / 5;
const MS_PER_MIN         = 60_000;

const EARLY_MS      =  5 * MS_PER_MIN;
const ON_TIME_MS    =  5 * MS_PER_MIN;
const LATE_MAX_MS   = 30 * MS_PER_MIN;

function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = deg => (deg * Math.PI) / 180;
    const dLat  = toRad(lat2 - lat1);
    const dLon  = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return EARTH_RADIUS_M * 2 * Math.asin(Math.sqrt(a));
}

function classifyAttendance(deltaMs) {
    if (deltaMs <= -EARLY_MS)      return 'Early';
    if (deltaMs <=  ON_TIME_MS)    return 'OnTime';
    if (deltaMs <=  LATE_MAX_MS)   return 'Late';
    return 'VeryLate';
}

class LocationService {
    constructor() {
        this.locationDao = new LocationDao();
        this.memberDao = new MemberDao();
        this.tripActivityService = new ActivityService();
    }

    async confirmStart(tripId) {
        const trip = await this.locationDao.findTripById(tripId);
        if (!trip) throw new Error('Trip not found');
        if (trip.trip_status === 'Active') return trip; // idempotent

        if (new Date(trip.start_time) > new Date()) {
            return trip; // not due yet — no-op, not an error
        }

        const activated = await this.locationDao.activateTrip(tripId);

        const members = await this.memberDao.findByTrip(tripId);
        const userIds = members
            .filter(m => m.memberStatus === 'Participating')
            .map(m => m.userId);

        if (userIds.length > 0) {
            await sendNotification(
                userIds,
                tripId,
                'TripStarted',
                `Trip "${trip.trip_name}" has started! Tracking is now active.`,
            );
        }

        return activated;
    }

    async findAndStartDueTrips() {
        const dueTrips = await this.locationDao.findDueTrips('Upcoming', new Date());

        const results = await Promise.allSettled(
            dueTrips.map(trip => this.confirmStart(trip.trip_id))
        );

        results.forEach((r, i) => {
            if (r.status === 'rejected') {
                console.error(`Failed to start trip ${dueTrips[i].trip_id}:`, r.reason);
            }
        });
    }

    async saveLocation(tripId, saveLocationDto) {
        const trip = await this.locationDao.findTripById(tripId);
        if (!trip) throw new Error('Trip not found');
        if (trip.trip_status !== 'Active') throw new Error('Trip is not active');

        const location = await this.locationDao.save(tripId, saveLocationDto);

        await this.tripActivityService.confirmStop(tripId, {
            userId:    saveLocationDto.userId,
            latitude:  saveLocationDto.latitude,
            longitude: saveLocationDto.longitude,
            timestamp: saveLocationDto.locationTimestamp,
        }).catch(err => console.error(`confirmStop failed for trip ${tripId}:`, err));

        return location;
    }

    async getLatestLocations(tripId) {
        const trip = await this.locationDao.findTripById(tripId);
        if (!trip) throw new Error('Trip not found');
        if (trip.trip_status !== 'Active') throw new Error('Trip is not active');

        return this.locationDao.findLatestPerMember(tripId);
    }

    async evaluateAttendance(tripId) {
        const trip = await this.locationDao.findTripById(tripId);
        if (!trip) throw new Error('Trip not found');

        const members        = await this.locationDao.findTripMembers(tripId);
        const startDate      = new Date(trip.start_date);
        const hasMeetingPoint = trip.meeting_point_lat != null && trip.meeting_point_lon != null;

        let mpLat, mpLon;
        if (hasMeetingPoint) {
            mpLat = trip.meeting_point_lat;
            mpLon = trip.meeting_point_lon;
        }

        const results = [];

        for (const member of members) {
            const locations = await this.locationDao.findByUser(member.user_id, tripId);
            let arrivalTime = null;

            if (hasMeetingPoint) {
                for (const loc of locations) {
                    const dist = haversineDistance(
                        parseFloat(loc.latitude), parseFloat(loc.longitude),
                        mpLat, mpLon,
                    );
                    if (dist <= VICINITY_RADIUS_M) {
                        arrivalTime = new Date(loc.locationTimestamp);
                        break;
                    }
                }
            } else {
                for (const loc of locations) {
                    const lat = parseFloat(loc.latitude);
                    const lon = parseFloat(loc.longitude);
                    let nearbyCount = 1;

                    for (const other of members) {
                        if (other.user_id === member.user_id) continue;
                        const otherLocs = await this.locationDao.findByUser(other.user_id, tripId);
                        const contemporaneous = otherLocs
                            .filter(ol => new Date(ol.locationTimestamp) <= new Date(loc.locationTimestamp))
                            .at(-1);

                        if (!contemporaneous) continue;

                        const dist = haversineDistance(
                            lat, lon,
                            parseFloat(contemporaneous.latitude),
                            parseFloat(contemporaneous.longitude),
                        );
                        if (dist <= VICINITY_RADIUS_M) nearbyCount++;
                    }

                    if (nearbyCount / members.length >= MAJORITY_THRESHOLD) {
                        arrivalTime = new Date(loc.locationTimestamp);
                        break;
                    }
                }
            }

            const attendance = arrivalTime
                ? classifyAttendance(arrivalTime.getTime() - startDate.getTime())
                : 'Missing';

            const updated = await this.locationDao.updateAttendance(tripId, member.user_id, attendance);
            results.push({ ...updated, first_name: member.first_name, last_name: member.last_name });
        }

        return results;
    }

    async checkDueAttendance() {
        const windowEnd = new Date(Date.now() + 2 * 60 * MS_PER_MIN); // now + 2 hours
        const dueTrips = await this.locationDao.findTripsForAttendanceCheck(windowEnd);

        const results = await Promise.allSettled(
            dueTrips.map(trip => this.evaluateAttendance(trip.trip_id))
        );

        results.forEach((r, i) => {
            if (r.status === 'rejected') {
                console.error(`Failed to evaluate attendance for trip ${dueTrips[i].trip_id}:`, r.reason);
            }
        });
    }
}

module.exports = LocationService;