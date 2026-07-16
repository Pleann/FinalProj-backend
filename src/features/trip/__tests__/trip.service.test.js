jest.mock('../trip.dao');
jest.mock('../../tripMember/tripMember.service');
jest.mock('../../../util/uploadImage');

const TripService = require('../trip.service');
const TripDao = require('../trip.dao');
const TripMemberService = require('../../tripMember/tripMember.service');
const uploadImage = require('../../../util/uploadImage');

// Appendix A
const createTripDtoA = {
    trip_name: 'Park trip',
    start_date: '2026-01-18',
    end_date: '2026-01-19',
    start_time: '2026-06-18T08:30:00',
    trip_destination: 'Royal Park Rajapruk',
    meeting_point: 'Royal Park Rajapruk',
};

describe('TripService', () => {
    let tripService;
    let daoMock;
    let tripMemberServiceMock;

    beforeEach(() => {
        tripService = new TripService();
        daoMock = TripDao.mock.instances[0];
        tripMemberServiceMock = TripMemberService.mock.instances[0];
    });

    describe('UTC-01: createTrip', () => {
        test('UTC-01-01: creates a trip successfully without a file', async () => {
            const savedTrip = { tripId: 1, ...createTripDtoA };
            daoMock.insert.mockResolvedValue(savedTrip);
            tripMemberServiceMock.addMember.mockResolvedValue({});

            const result = await tripService.createTrip({ ...createTripDtoA }, 1, null);

            expect(uploadImage).not.toHaveBeenCalled();
            expect(daoMock.insert).toHaveBeenCalledWith({ ...createTripDtoA }, 1);
            expect(tripMemberServiceMock.addMember).toHaveBeenCalledWith(savedTrip.tripId, 1, 'Participating');
            expect(result).toEqual(savedTrip);
        });

        test('UTC-01-02: creates a trip successfully with a file', async () => {
            const file = { originalname: 'profile_photo_test.png' };
            const imageUrl = 'https://example.com/profile_photo_test.png';
            const savedTrip = { tripId: 1, ...createTripDtoA, imageUrl };
            uploadImage.mockResolvedValue(imageUrl);
            daoMock.insert.mockResolvedValue(savedTrip);
            tripMemberServiceMock.addMember.mockResolvedValue({});

            const dto = { ...createTripDtoA };
            const result = await tripService.createTrip(dto, 1, file);

            expect(uploadImage).toHaveBeenCalledWith(file);
            expect(dto.imageUrl).toBe(imageUrl);
            expect(result).toEqual(savedTrip);
            expect(result.imageUrl).toBe(imageUrl);
        });

        test('UTC-01-03: throws an error when createTripDto is missing', async () => {
            const file = { originalname: 'profile_photo_test.png' };

            await expect(tripService.createTrip(null, 1, file)).rejects.toThrow('Could not create trip');
            expect(daoMock.insert).not.toHaveBeenCalled();
        });

        test('UTC-01-04: throws an error when uploadImage fails', async () => {
            const file = { originalname: 'profile_photo_test.png' };
            uploadImage.mockRejectedValue(new Error('Image upload failed: network error'));

            await expect(tripService.createTrip({ ...createTripDtoA }, 1, file))
                .rejects.toThrow('Image upload failed: network error');
            expect(daoMock.insert).not.toHaveBeenCalled();
        });
    });

    describe('UTC-02: getUpcomingTrips', () => {
        test('UTC-02-01: returns upcoming trips successfully', async () => {
            const trips = [{ tripId: 1, trip_status: 'Upcoming' }];
            daoMock.findByStatus.mockResolvedValue(trips);

            const result = await tripService.getUpcomingTrips();

            expect(daoMock.findByStatus).toHaveBeenCalledWith('Upcoming');
            expect(result).toEqual(trips);
        });

        test('UTC-02-02: throws an error when fetching upcoming trips fails', async () => {
            daoMock.findByStatus.mockResolvedValue(null);

            await expect(tripService.getUpcomingTrips()).rejects.toThrow('Could not find upcoming trips');
        });
    });

    describe('UTC-03: getActiveTrips', () => {
        test('UTC-03-01: returns active trips successfully', async () => {
            const trips = [{ tripId: 1, trip_status: 'Active' }];
            daoMock.findByStatus.mockResolvedValue(trips);

            const result = await tripService.getActiveTrips();

            expect(daoMock.findByStatus).toHaveBeenCalledWith('Active');
            expect(result).toEqual(trips);
        });

        test('UTC-03-02: throws an error when fetching active trips fails', async () => {
            daoMock.findByStatus.mockResolvedValue(null);

            await expect(tripService.getActiveTrips()).rejects.toThrow('Could not find Active trips');
        });
    });

    describe('UTC-04: getCompletedTrips', () => {
        test('UTC-04-01: returns completed trips successfully', async () => {
            const trips = [{ tripId: 1, trip_status: 'Completed' }];
            daoMock.findByStatus.mockResolvedValue(trips);

            const result = await tripService.getCompletedTrips();

            expect(daoMock.findByStatus).toHaveBeenCalledWith('Completed');
            expect(result).toEqual(trips);
        });

        test('UTC-04-02: throws an error when fetching completed trips fails', async () => {
            daoMock.findByStatus.mockResolvedValue(null);

            await expect(tripService.getCompletedTrips()).rejects.toThrow('Could not find completed trips');
        });
    });

    describe('UTC-05: updateTrip', () => {
        // Appendix B translated to the camelCase shape updateTrip actually reads off `body`
        const updateBodyB = {
            tripName: 'Beach trip',
            startDate: '2026-01-18',
            endDate: '2026-01-19',
            startTime: '2026-06-18T08:30:00',
            tripDestination: 'Royal Park Chiang Rai',
            meetingPointName: 'Royal Park Chiang Rai',
        };

        test('UTC-05-01: updates a trip successfully without a file', async () => {
            const savedTrip = { tripId: 1, trip_name: 'Beach trip' };
            daoMock.update.mockResolvedValue(savedTrip);

            const result = await tripService.updateTrip(1, { ...updateBodyB }, null);

            expect(uploadImage).not.toHaveBeenCalled();
            expect(daoMock.update).toHaveBeenCalled();
            expect(result).toEqual(savedTrip);
        });

        test('UTC-05-02: updates a trip successfully with a file', async () => {
            const file = { originalname: 'profile_photo_test.png' };
            const imageUrl = 'https://example.com/profile_photo_test.png';
            const savedTrip = { tripId: 1, trip_name: 'Beach trip', image_url: imageUrl };
            uploadImage.mockResolvedValue(imageUrl);
            daoMock.update.mockResolvedValue(savedTrip);

            const result = await tripService.updateTrip(1, { ...updateBodyB }, file);

            expect(uploadImage).toHaveBeenCalledWith(file);
            const [, fieldsArg] = daoMock.update.mock.calls[0];
            expect(fieldsArg.image_url).toBe(imageUrl);
            expect(result).toEqual(savedTrip);
        });

        test('UTC-05-03: throws an error when no fields are provided to update', async () => {
            // file=null: a truthy file always sets fields.image_url, which would
            // prevent the "No fields provided" branch from ever being reached.
            await expect(tripService.updateTrip(1, {}, null)).rejects.toThrow('No fields provided to update');
        });

        test('UTC-05-04: throws an error when start_time is after end_time', async () => {
            const file = { originalname: 'profile_photo_test.png' };
            // Appendix C: start_date after end_date
            const invalidBody = {
                startDate: '2026-01-21',
                endDate: '2026-01-19',
            };

            await expect(tripService.updateTrip(1, invalidBody, file))
                .rejects.toThrow('Start date must be before end date');
        });

        test('UTC-05-05: throws an error when uploadImage fails', async () => {
            const file = { originalname: 'profile_photo_test.png' };
            uploadImage.mockRejectedValue(new Error('Image upload failed: network error'));

            await expect(tripService.updateTrip(1, { ...updateBodyB }, file))
                .rejects.toThrow('Image upload failed: network error');
            expect(daoMock.update).not.toHaveBeenCalled();
        });
    });

    describe('UTC-06: updateTripStatus', () => {
        test('UTC-06-01: updates trip status successfully with "Upcoming"', async () => {
            const updated = { tripId: 1, trip_status: 'Upcoming' };
            daoMock.update.mockResolvedValue(updated);

            const result = await tripService.updateTripStatus(1, 'Upcoming');

            expect(daoMock.update).toHaveBeenCalledWith(1, { trip_status: 'Upcoming' });
            expect(result).toEqual(updated);
        });

        test('UTC-06-02: updates trip status successfully with "Active"', async () => {
            const updated = { tripId: 1, trip_status: 'Active' };
            daoMock.update.mockResolvedValue(updated);

            const result = await tripService.updateTripStatus(1, 'Active');

            expect(daoMock.update).toHaveBeenCalledWith(1, { trip_status: 'Active' });
            expect(result).toEqual(updated);
        });

        test('UTC-06-03: updates trip status successfully with "Completed"', async () => {
            const updated = { tripId: 1, trip_status: 'Completed' };
            daoMock.update.mockResolvedValue(updated);

            const result = await tripService.updateTripStatus(1, 'Completed');

            expect(daoMock.update).toHaveBeenCalledWith(1, { trip_status: 'Completed' });
            expect(result).toEqual(updated);
        });

        test('UTC-06-04: throws an error when status is invalid', async () => {
            await expect(tripService.updateTripStatus(1, null))
                .rejects.toThrow('Invalid status. Must be Upcoming, Active or Completed');
            expect(daoMock.update).not.toHaveBeenCalled();
        });
    });

    describe('UTC-07: deleteTrip', () => {
        test('UTC-07-01: deletes a trip successfully with a valid tripId', async () => {
            const deleted = { tripId: 1 };
            daoMock.delete.mockResolvedValue(deleted);

            const result = await tripService.deleteTrip(1);

            expect(daoMock.delete).toHaveBeenCalledWith(1);
            expect(result).toEqual(deleted);
        });

        test('UTC-07-02: throws an error with an invalid tripId', async () => {
            await expect(tripService.deleteTrip(null)).rejects.toThrow('Could not find trip ID');
            expect(daoMock.delete).not.toHaveBeenCalled();
        });
    });
});