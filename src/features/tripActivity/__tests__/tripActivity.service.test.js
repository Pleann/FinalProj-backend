jest.mock('../tripActivity.dao');
jest.mock('../../../util/sendNotification');

const TripActivityService = require('../tripActivity.service');
const TripActivityDao = require('../tripActivity.dao');

// Appendix E
const stop = {
    stopId: '1',
    tripId: '1',
    userId: '1',
    latitude: '18.7445',
    longitude: '98.9280',
    enteredAt: '2026-06-16T10:00:00',
    exitedAt: '2026-06-16T10:30:00',
};

describe('TripActivityService', () => {
    let tripActivityService;
    let daoMock;

    beforeEach(() => {
        tripActivityService = new TripActivityService();
        daoMock = TripActivityDao.mock.instances[0];
    });

    describe('UTC-20: confirmStop', () => {
        const baseDto = { userId: 1, latitude: 18.7445, longitude: 98.9280 };

        test('UTC-20-01: confirms a stop successfully when user remains within radius for minimum duration', async () => {
            const confirmedStop = { stopId: 1, tripId: 1, ...baseDto };
            daoMock.insertStop.mockResolvedValue(confirmedStop);
            jest.spyOn(tripActivityService, 'createActivityFromStop').mockResolvedValue({});

            const first = await tripActivityService.confirmStop(1, { ...baseDto, timestamp: '2026-06-16T10:00:00' });
            expect(first).toBeNull();

            const second = await tripActivityService.confirmStop(1, { ...baseDto, timestamp: '2026-06-16T10:05:00' });

            expect(daoMock.insertStop).toHaveBeenCalledWith(1, {
                userId: 1,
                latitude: 18.7445,
                longitude: 98.9280,
                enteredAt: new Date('2026-06-16T10:00:00'),
                exitedAt: new Date('2026-06-16T10:05:00'),
            });
            expect(second).toEqual(confirmedStop);
        });

        test('UTC-20-02: returns null when user is still within radius but minimum time has not elapsed', async () => {
            await tripActivityService.confirmStop(1, { ...baseDto, timestamp: '2026-06-16T10:00:00' });

            const result = await tripActivityService.confirmStop(1, { ...baseDto, timestamp: '2026-06-16T10:02:00' });

            expect(result).toBeNull();
            expect(daoMock.insertStop).not.toHaveBeenCalled();
            expect(tripActivityService.pendingStops['1_1']).toBeDefined();
        });

        test('UTC-20-03: discards pending stop and returns null when user leaves radius before minimum time', async () => {
            await tripActivityService.confirmStop(1, { ...baseDto, timestamp: '2026-06-16T10:00:00' });

            const farAwayDto = { userId: 1, latitude: 19.7445, longitude: 99.9280, timestamp: '2026-06-16T10:02:00' };
            const result = await tripActivityService.confirmStop(1, farAwayDto);

            expect(result).toBeNull();
            expect(daoMock.insertStop).not.toHaveBeenCalled();
            expect(tripActivityService.pendingStops['1_1']).toEqual({
                latitude: 19.7445,
                longitude: 99.9280,
                enteredAt: new Date('2026-06-16T10:02:00'),
            });
        });

        test('UTC-20-04: starts tracking a new potential stop when no pending stop exists', async () => {
            const result = await tripActivityService.confirmStop(1, { ...baseDto, timestamp: '2026-06-16T10:00:00' });

            expect(result).toBeNull();
            expect(daoMock.insertStop).not.toHaveBeenCalled();
            expect(tripActivityService.pendingStops['1_1']).toEqual({
                latitude: 18.7445,
                longitude: 98.9280,
                enteredAt: new Date('2026-06-16T10:00:00'),
            });
        });
    });

    describe('UTC-21: createActivityFromStop', () => {
        test('UTC-21-01: creates an activity from a stop successfully', async () => {
            const placeData = { locationName: 'Some Cafe', locationType: 'cafe', types: ['cafe'] };
            jest.spyOn(tripActivityService, 'callGooglePlacesAPI').mockResolvedValue(placeData);
            const activity = { activityId: 10, locationName: 'Some Cafe' };
            daoMock.insertActivity.mockResolvedValue(activity);
            daoMock.linkStopToActivity.mockResolvedValue({});

            const result = await tripActivityService.createActivityFromStop(stop);

            expect(tripActivityService.callGooglePlacesAPI).toHaveBeenCalledWith(18.7445, 98.9280);
            expect(daoMock.linkStopToActivity).toHaveBeenCalledWith(stop.stopId, activity.activityId);
            expect(result).toEqual(activity);
        });

        test('UTC-21-02: throws an error when Google Places API call fails', async () => {
            jest.spyOn(tripActivityService, 'callGooglePlacesAPI').mockRejectedValue(new Error('Network timeout'));

            await expect(tripActivityService.createActivityFromStop(stop))
                .rejects.toThrow(`Failed to fetch place data for stop ${stop.stopId}: Network timeout`);
            expect(daoMock.insertActivity).not.toHaveBeenCalled();
        });

        test('UTC-21-03: throws an error when linking stop to activity fails', async () => {
            const placeData = { locationName: 'Some Cafe', locationType: 'cafe', types: ['cafe'] };
            jest.spyOn(tripActivityService, 'callGooglePlacesAPI').mockResolvedValue(placeData);
            const activity = { activityId: 10, locationName: 'Some Cafe' };
            daoMock.insertActivity.mockResolvedValue(activity);
            daoMock.linkStopToActivity.mockRejectedValue(new Error('Stop already linked'));

            await expect(tripActivityService.createActivityFromStop(stop))
                .rejects.toThrow(`Failed to link stop ${stop.stopId} to activity 10: Stop already linked`);
        });
    });

    describe('UTC-22: getTimeline', () => {
        test('UTC-22-01: returns all activities for a trip successfully', async () => {
            const activities = [{ activityId: 1, tripId: 1 }];
            daoMock.findActivitiesByTrip.mockResolvedValue(activities);

            const result = await tripActivityService.getTimeline(1);

            expect(daoMock.findActivitiesByTrip).toHaveBeenCalledWith(1);
            expect(result).toEqual(activities);
        });

        test('UTC-22-02: returns an empty array when no activities are found', async () => {
            daoMock.findActivitiesByTrip.mockResolvedValue([]);

            const result = await tripActivityService.getTimeline(4);

            expect(result).toEqual([]);
        });
    });

    describe('UTC-23: callGooglePlacesAPI', () => {
        beforeEach(() => {
            global.fetch = jest.fn();
        });

        afterEach(() => {
            delete global.fetch;
        });

        test('UTC-23-01: returns place details successfully for valid coordinates', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    places: [{ displayName: { text: 'Some Cafe' }, types: ['cafe', 'restaurant'] }],
                }),
            });

            const result = await tripActivityService.callGooglePlacesAPI(18.7445, 98.9280);

            expect(result).toEqual({ locationName: 'Some Cafe', locationType: 'cafe', types: ['cafe', 'restaurant'] });
        });

        test('UTC-23-02: throws an error when API response is not ok', async () => {
            global.fetch.mockResolvedValue({ ok: false, statusText: 'Internal Server Error' });

            await expect(tripActivityService.callGooglePlacesAPI(18.7445, 98.9280))
                .rejects.toThrow('Google Places API error: Internal Server Error');
        });

        test('UTC-23-03: throws an error when no place is found at the location', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ places: [] }),
            });

            await expect(tripActivityService.callGooglePlacesAPI(18.7445, 98.9280))
                .rejects.toThrow('No place found at this location');
        });

        test('UTC-23-04: returns "Unknown" for locationName when displayName is missing', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ places: [{ types: ['cafe'] }] }),
            });

            const result = await tripActivityService.callGooglePlacesAPI(18.7445, 98.9280);

            expect(result.locationName).toBe('Unknown');
        });

        test('UTC-23-05: returns "Unknown" for locationType when types array is empty', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ places: [{ displayName: { text: 'Some Place' }, types: [] }] }),
            });

            const result = await tripActivityService.callGooglePlacesAPI(18.7445, 98.9280);

            expect(result.locationType).toBe('Unknown');
            expect(result.types).toEqual([]);
        });
    });
});