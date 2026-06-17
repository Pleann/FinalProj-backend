const LocationRepository = require('./tripLocation.repository');

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
        this.locationRepo = new LocationRepository();
    }

    async confirmStart(tripId) {
        const trip = await this.locationRepo.findTripById(tripId);
        if (!trip) throw new Error('Trip not found');
        if (trip.trip_status === 'Active') return trip; // idempotent

        const activated = await this.locationRepo.activateTrip(tripId);

        // TODO: send trip-start notification to all members
        // await notificationService.sendTripStarted(tripId);

        return activated;
    }

    async getStart(tripId) {
        const trip = await this.locationRepo.findTripById(tripId);
        if (!trip) throw new Error('Trip not found');
        return trip;
    }

    async saveLocation(tripId, saveLocationDto) {
        const trip = await this.locationRepo.findTripById(tripId);
        if (!trip) throw new Error('Trip not found');
        if (trip.trip_status !== 'Active') throw new Error('Trip is not active');

        return this.locationRepo.save(
            tripId,
            saveLocationDto.userId,
            saveLocationDto.latitude,
            saveLocationDto.longitude,
            saveLocationDto.locationTimestamp,
        );
    }

    async getLatestLocations(tripId) {
        const trip = await this.locationRepo.findTripById(tripId);
        if (!trip) throw new Error('Trip not found');
        if (trip.trip_status !== 'Active') throw new Error('Trip is not active');

        return this.locationRepo.findLatestPerMember(tripId);
    }

    async evaluateAttendance(tripId) {
        const trip = await this.locationRepo.findTripById(tripId);
        if (!trip) throw new Error('Trip not found');

        const members        = await this.locationRepo.findTripMembers(tripId);
        const startTime      = new Date(trip.start_time);
        const hasMeetingPoint = Boolean(trip.meeting_point);

        let mpLat, mpLon;
        if (hasMeetingPoint) {
            [mpLat, mpLon] = trip.meeting_point.split(',').map(Number);
        }

        const results = [];

        for (const member of members) {
            const locations = await this.locationRepo.findByUser(member.user_id, tripId);
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
                        const otherLocs = await this.locationRepo.findByUser(other.user_id, tripId);
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
                ? classifyAttendance(arrivalTime.getTime() - startTime.getTime())
                : 'Missing';

            const updated = await this.locationRepo.updateAttendance(tripId, member.user_id, attendance);
            results.push({ ...updated, first_name: member.first_name, last_name: member.last_name });
        }

        return results;
    }

    async getAttendance(tripId) {
        const trip = await this.locationRepo.findTripById(tripId);
        if (!trip) throw new Error('Trip not found');
        return this.locationRepo.findAttendanceByTrip(tripId);
    }
}

module.exports = LocationService;