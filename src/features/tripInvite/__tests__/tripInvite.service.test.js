jest.mock('../tripInvite.dao');
jest.mock('../../../util/sendNotification');
jest.mock('../../../config/db');

const TripInviteService = require('../tripInvite.service');
const TripInviteDao = require('../tripInvite.dao');
const sendNotification = require('../../../util/sendNotification');
const pool = require('../../../config/db');

describe('TripInviteService', () => {
    let tripInviteService;
    let daoMock;

    beforeEach(() => {
        tripInviteService = new TripInviteService();
        daoMock = TripInviteDao.mock.instances[0];
    });

    describe('UTC-08: sendInvite', () => {
        test('UTC-08-01: sends an invite successfully', async () => {
            pool.query.mockResolvedValue({
                rows: [{ trip_id: 1, created_by: 1, trip_status: 'Upcoming', trip_name: 'Park trip' }],
            });
            const savedInvite = { tripInviteId: 1, tripId: 1, userId: 2, inviteStatus: 'Undecided' };
            daoMock.insert.mockResolvedValue(savedInvite);
            sendNotification.mockResolvedValue([]);

            const result = await tripInviteService.sendInvite(1, { userId: 2 }, 1);

            expect(daoMock.insert).toHaveBeenCalledWith(1, 2);
            expect(sendNotification).toHaveBeenCalledWith(
                [2], 1, 'TripInvite', `You've been invited to "Park trip"`, savedInvite.tripInviteId,
            );
            expect(result).toEqual(savedInvite);
        });

        test('UTC-08-02: throws an error when trip is not found', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(tripInviteService.sendInvite(0, { userId: 2 }, 1))
                .rejects.toThrow('Trip not found');
            expect(daoMock.insert).not.toHaveBeenCalled();
        });

        test('UTC-08-03: throws an error when requester is not the trip owner', async () => {
            pool.query.mockResolvedValue({
                rows: [{ trip_id: 1, created_by: 1, trip_status: 'Upcoming', trip_name: 'Park trip' }],
            });

            await expect(tripInviteService.sendInvite(1, { userId: 2 }, 3))
                .rejects.toThrow('Only the trip owner can send invites');
            expect(daoMock.insert).not.toHaveBeenCalled();
        });

        test('UTC-08-04: throws an error when trip status is not Upcoming', async () => {
            pool.query.mockResolvedValue({
                rows: [{ trip_id: 1, created_by: 1, trip_status: 'Active', trip_name: 'Park trip' }],
            });

            await expect(tripInviteService.sendInvite(1, { userId: 2 }, 1))
                .rejects.toThrow('Can only invite members to Upcoming trips');
            expect(daoMock.insert).not.toHaveBeenCalled();
        });
    });

    describe('UTC-09: getInvitesByTrip', () => {
        test('UTC-09-01: returns all invites for a trip successfully', async () => {
            const invites = [{ tripInviteId: 1, tripId: 1, userId: 2 }];
            daoMock.findByTrip.mockResolvedValue(invites);

            const result = await tripInviteService.getInvitesByTrip(1);

            expect(daoMock.findByTrip).toHaveBeenCalledWith(1);
            expect(result).toEqual(invites);
        });

        test('UTC-09-02: throws an error when tripId is missing', async () => {
            await expect(tripInviteService.getInvitesByTrip(null))
                .rejects.toThrow('Could not fetch invite by tripId');
            expect(daoMock.findByTrip).not.toHaveBeenCalled();
        });
    });

    describe('UTC-10: respondToInvite', () => {
        test('UTC-10-01: responds to an invite successfully with "Accept"', async () => {
            daoMock.findById.mockResolvedValue({ tripInviteId: 1, tripId: 1, userId: 2 });
            pool.query.mockResolvedValue({ rows: [] });
            const updatedInvite = { tripInviteId: 1, tripId: 1, userId: 2, inviteStatus: 'Accept' };
            daoMock.updateStatus.mockResolvedValue(updatedInvite);

            const result = await tripInviteService.respondToInvite(1, { inviteStatus: 'Accept' });

            expect(pool.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO TripMember'),
                [1, 2],
            );
            expect(daoMock.updateStatus).toHaveBeenCalledWith(1, 'Accept');
            expect(result).toEqual(updatedInvite);
        });

        test('UTC-10-02: responds to an invite successfully with "Rejected"', async () => {
            daoMock.findById.mockResolvedValue({ tripInviteId: 1, tripId: 1, userId: 2 });
            const updatedInvite = { tripInviteId: 1, tripId: 1, userId: 2, inviteStatus: 'Rejected' };
            daoMock.updateStatus.mockResolvedValue(updatedInvite);

            const result = await tripInviteService.respondToInvite(1, { inviteStatus: 'Rejected' });

            expect(pool.query).not.toHaveBeenCalled();
            expect(daoMock.updateStatus).toHaveBeenCalledWith(1, 'Rejected');
            expect(result).toEqual(updatedInvite);
        });

        test('UTC-10-03: responds to an invite successfully with "Cancelled"', async () => {
            daoMock.findById.mockResolvedValue({ tripInviteId: 1, tripId: 1, userId: 2 });
            const updatedInvite = { tripInviteId: 1, tripId: 1, userId: 2, inviteStatus: 'Cancelled' };
            daoMock.updateStatus.mockResolvedValue(updatedInvite);

            const result = await tripInviteService.respondToInvite(1, { inviteStatus: 'Cancelled' });

            expect(pool.query).not.toHaveBeenCalled();
            expect(daoMock.updateStatus).toHaveBeenCalledWith(1, 'Cancelled');
            expect(result).toEqual(updatedInvite);
        });
    });
});