jest.mock('../tripLocation.dao');
jest.mock('../../tripMember/tripMember.dao');
jest.mock('../../tripActivity/tripActivity.service');
jest.mock('../../../util/sendNotification');

const LocationService = require('../tripLocation.service');
const LocationDao = require('../tripLocation.dao');
const MemberDao = require('../../tripMember/tripMember.dao');
const ActivityService = require('../../tripActivity/tripActivity.service');
const sendNotification = require('../../../util/sendNotification');

// Appendix D
const saveLocationDto = {
    user_id: '1',
    latitude: '18.7445',
    longitude: '98.9280',
    location_timestamp: '2026-06-16T10:00:00',
};

describe('LocationService', () => {
    let locationService;
    let locationDaoMock;
    let memberDaoMock;
    let activityServiceMock;

    beforeEach(() => {
        locationService = new LocationService();
        locationDaoMock = LocationDao.mock.instances[0];
        memberDaoMock = MemberDao.mock.instances[0];
        activityServiceMock = ActivityService.mock.instances[0];
    });

    describe('UTC-14: confirmStart', () => {
        test('UTC-14-01: confirms trip start successfully', async () => {
            const trip = {
                trip_id: 1,
                trip_name: 'Park trip',
                trip_status: 'Upcoming',
                start_time: '2020-01-01T00:00:00',
            };
            const activatedTrip = { ...trip, trip_status: 'Active' };
            locationDaoMock.findTripById.mockResolvedValue(trip);
            locationDaoMock.activateTrip.mockResolvedValue(activatedTrip);
            memberDaoMock.findByTrip.mockResolvedValue([
                { user_id: 1, member_status: 'Participating' },
            ]);
            sendNotification.mockResolvedValue([]);

            const result = await locationService.confirmStart(1);

            expect(locationDaoMock.activateTrip).toHaveBeenCalledWith(1);
            expect(sendNotification).toHaveBeenCalledWith(
                [1], 1, 'TripStarted', `Trip "Park trip" has started! Tracking is now active.`,
            );
            expect(result).toEqual(activatedTrip);
        });

        test('UTC-14-02: throws an error when trip is not found', async () => {
            locationDaoMock.findTripById.mockResolvedValue(null);

            await expect(locationService.confirmStart(null)).rejects.toThrow('Trip not found');
            expect(locationDaoMock.activateTrip).not.toHaveBeenCalled();
        });
    });

    describe('UTC-15: findAndStartDueTrips', () => {
        test('UTC-15-01: calls confirmStart for each due trip', async () => {
            const dueTrips = [{ trip_id: 1 }];
            locationDaoMock.findDueTrips.mockResolvedValue(dueTrips);
            const confirmStartSpy = jest.spyOn(locationService, 'confirmStart').mockResolvedValue({});

            await locationService.findAndStartDueTrips();

            expect(confirmStartSpy).toHaveBeenCalledWith(1);
        });

        test('UTC-15-02: does nothing when there are no due trips', async () => {
            locationDaoMock.findDueTrips.mockResolvedValue([]);
            const confirmStartSpy = jest.spyOn(locationService, 'confirmStart').mockResolvedValue({});

            await locationService.findAndStartDueTrips();

            expect(confirmStartSpy).not.toHaveBeenCalled();
        });
    });

    describe('UTC-16: saveLocation', () => {
        test('UTC-16-01: saves location successfully for an active trip', async () => {
            const trip = { trip_id: 1, trip_status: 'Active' };
            const savedLocation = { locationId: 1, tripId: 1, ...saveLocationDto };
            locationDaoMock.findTripById.mockResolvedValue(trip);
            locationDaoMock.save.mockResolvedValue(savedLocation);
            activityServiceMock.confirmStop.mockResolvedValue(null);

            const result = await locationService.saveLocation(1, saveLocationDto);

            expect(locationDaoMock.save).toHaveBeenCalledWith(1, saveLocationDto);
            expect(result).toEqual(savedLocation);
        });

        test('UTC-16-02: throws an error when trip is not found', async () => {
            locationDaoMock.findTripById.mockResolvedValue(null);

            await expect(locationService.saveLocation(null, saveLocationDto))
                .rejects.toThrow('Trip not found');
            expect(locationDaoMock.save).not.toHaveBeenCalled();
        });

        test('UTC-16-03: throws an error when trip is not active', async () => {
            const trip = { trip_id: 3, trip_status: 'Upcoming' };
            locationDaoMock.findTripById.mockResolvedValue(trip);

            await expect(locationService.saveLocation(3, saveLocationDto))
                .rejects.toThrow('Trip is not active');
            expect(locationDaoMock.save).not.toHaveBeenCalled();
        });
    });

    describe('UTC-17: getLatestLocations', () => {
        test('UTC-17-01: returns latest locations of all members successfully', async () => {
            const trip = { trip_id: 1, trip_status: 'Active' };
            const latestLocations = [{ user_id: 1, latitude: '18.7445', longitude: '98.9280' }];
            locationDaoMock.findTripById.mockResolvedValue(trip);
            locationDaoMock.findLatestPerMember.mockResolvedValue(latestLocations);

            const result = await locationService.getLatestLocations(1);

            expect(locationDaoMock.findLatestPerMember).toHaveBeenCalledWith(1);
            expect(result).toEqual(latestLocations);
        });

        test('UTC-17-02: throws an error when trip is not found', async () => {
            locationDaoMock.findTripById.mockResolvedValue(null);

            await expect(locationService.getLatestLocations(null))
                .rejects.toThrow('Trip not found');
        });

        test('UTC-17-03: throws an error when trip is not active', async () => {
            const trip = { trip_id: 3, trip_status: 'Upcoming' };
            locationDaoMock.findTripById.mockResolvedValue(trip);

            await expect(locationService.getLatestLocations(3))
                .rejects.toThrow('Trip is not active');
        });
    });

    describe('UTC-18: evaluateAttendance', () => {
        const trip = {
            trip_id: 1,
            trip_status: 'Active',
            start_date: '2026-06-16T10:00:00',
        };

        test('UTC-18-01: evaluates attendance successfully with a meeting point', async () => {
            const tripWithMeetingPoint = { ...trip, meeting_point_lat: 18.7445, meeting_point_lon: 98.9280 };
            const members = [{ user_id: 1, first_name: 'A', last_name: 'B' }];
            locationDaoMock.findTripById.mockResolvedValue(tripWithMeetingPoint);
            locationDaoMock.findTripMembers.mockResolvedValue(members);
            locationDaoMock.findByUser.mockResolvedValue([
                { latitude: '18.7445', longitude: '98.9280', locationTimestamp: '2026-06-16T09:58:00' },
            ]);
            locationDaoMock.updateAttendance.mockResolvedValue({ user_id: 1, attendance: 'OnTime' });

            const result = await locationService.evaluateAttendance(1);

            expect(locationDaoMock.updateAttendance).toHaveBeenCalledWith(1, 1, 'OnTime');
            expect(result).toEqual([{ user_id: 1, attendance: 'OnTime', first_name: 'A', last_name: 'B' }]);
        });

        test('UTC-18-02: evaluates attendance successfully without a meeting point', async () => {
            const members = [
                { user_id: 1, first_name: 'A', last_name: 'B' },
                { user_id: 2, first_name: 'C', last_name: 'D' },
            ];
            locationDaoMock.findTripById.mockResolvedValue(trip);
            locationDaoMock.findTripMembers.mockResolvedValue(members);
            locationDaoMock.findByUser.mockImplementation((userId) => {
                if (userId === 1) {
                    return Promise.resolve([
                        { latitude: '18.7445', longitude: '98.9280', locationTimestamp: '2026-06-16T09:58:00' },
                    ]);
                }
                return Promise.resolve([
                    { latitude: '18.7445', longitude: '98.9280', locationTimestamp: '2026-06-16T09:58:00' },
                ]);
            });
            locationDaoMock.updateAttendance.mockImplementation((tripId, userId) =>
                Promise.resolve({ user_id: userId, attendance: 'OnTime' }));

            const result = await locationService.evaluateAttendance(1);

            expect(result).toHaveLength(2);
            expect(locationDaoMock.updateAttendance).toHaveBeenCalledWith(1, 1, 'OnTime');
        });

        test('UTC-18-03: marks member as "Missing" when no location data is found', async () => {
            const members = [{ user_id: 1, first_name: 'A', last_name: 'B' }];
            locationDaoMock.findTripById.mockResolvedValue(trip);
            locationDaoMock.findTripMembers.mockResolvedValue(members);
            locationDaoMock.findByUser.mockResolvedValue([]);
            locationDaoMock.updateAttendance.mockResolvedValue({ user_id: 1, attendance: 'Missing' });

            const result = await locationService.evaluateAttendance(1);

            expect(locationDaoMock.updateAttendance).toHaveBeenCalledWith(1, 1, 'Missing');
            expect(result[0].attendance).toBe('Missing');
        });

        test('UTC-18-04: marks member as "On Time" when arriving before or at start time', async () => {
            const tripWithMeetingPoint = { ...trip, meeting_point_lat: 18.7445, meeting_point_lon: 98.9280 };
            const members = [{ user_id: 1, first_name: 'A', last_name: 'B' }];
            locationDaoMock.findTripById.mockResolvedValue(tripWithMeetingPoint);
            locationDaoMock.findTripMembers.mockResolvedValue(members);
            locationDaoMock.findByUser.mockResolvedValue([
                { latitude: '18.7445', longitude: '98.9280', locationTimestamp: '2026-06-16T09:59:00' },
            ]);
            locationDaoMock.updateAttendance.mockResolvedValue({ user_id: 1, attendance: 'OnTime' });

            const result = await locationService.evaluateAttendance(1);

            expect(locationDaoMock.updateAttendance).toHaveBeenCalledWith(1, 1, 'OnTime');
            expect(result[0].attendance).toBe('OnTime');
        });

        test('UTC-18-05: marks member as "Late" when arriving after start time', async () => {
            const tripWithMeetingPoint = { ...trip, meeting_point_lat: 18.7445, meeting_point_lon: 98.9280 };
            const members = [{ user_id: 1, first_name: 'A', last_name: 'B' }];
            locationDaoMock.findTripById.mockResolvedValue(tripWithMeetingPoint);
            locationDaoMock.findTripMembers.mockResolvedValue(members);
            locationDaoMock.findByUser.mockResolvedValue([
                { latitude: '18.7445', longitude: '98.9280', locationTimestamp: '2026-06-16T10:15:00' },
            ]);
            locationDaoMock.updateAttendance.mockResolvedValue({ user_id: 1, attendance: 'Late' });

            const result = await locationService.evaluateAttendance(1);

            expect(locationDaoMock.updateAttendance).toHaveBeenCalledWith(1, 1, 'Late');
            expect(result[0].attendance).toBe('Late');
        });

        test('UTC-18-06: throws an error when trip is not found', async () => {
            locationDaoMock.findTripById.mockResolvedValue(null);

            await expect(locationService.evaluateAttendance(null)).rejects.toThrow('Trip not found');
            expect(locationDaoMock.findTripMembers).not.toHaveBeenCalled();
        });
    });

    describe('UTC-19: checkDueAttendance', () => {
        test('UTC-19-01: evaluates attendance for all due trips successfully', async () => {
            const dueTrips = [{ trip_id: 1 }];
            locationDaoMock.findTripsForAttendanceCheck.mockResolvedValue(dueTrips);
            const evaluateAttendanceSpy = jest.spyOn(locationService, 'evaluateAttendance').mockResolvedValue([]);

            await locationService.checkDueAttendance();

            expect(evaluateAttendanceSpy).toHaveBeenCalledWith(1);
        });

        test('UTC-19-02: does nothing when there are no trips due for attendance check', async () => {
            locationDaoMock.findTripsForAttendanceCheck.mockResolvedValue([]);
            const evaluateAttendanceSpy = jest.spyOn(locationService, 'evaluateAttendance').mockResolvedValue([]);

            await locationService.checkDueAttendance();

            expect(evaluateAttendanceSpy).not.toHaveBeenCalled();
        });
    });
});