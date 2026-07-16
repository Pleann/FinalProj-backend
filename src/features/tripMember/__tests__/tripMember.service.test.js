jest.mock('../tripMember.dao');
jest.mock('../../../config/db');

const TripMemberService = require('../tripMember.service');
const TripMemberDao = require('../tripMember.dao');
const pool = require('../../../config/db');

describe('TripMemberService', () => {
    let tripMemberService;
    let daoMock;

    beforeEach(() => {
        tripMemberService = new TripMemberService();
        daoMock = TripMemberDao.mock.instances[0];
    });

    describe('UTC-11: getMembersByTrip', () => {
        test('UTC-11-01: returns all members for a trip successfully', async () => {
            const members = [{ participantId: 1, tripId: 1, userId: 1 }];
            daoMock.findByTrip.mockResolvedValue(members);

            const result = await tripMemberService.getMembersByTrip(1);

            expect(daoMock.findByTrip).toHaveBeenCalledWith(1);
            expect(result).toEqual(members);
        });

        test('UTC-11-02: throws an error when tripId is missing', async () => {
            await expect(tripMemberService.getMembersByTrip(null))
                .rejects.toThrow('Could not fetch member by tripId');
            expect(daoMock.findByTrip).not.toHaveBeenCalled();
        });
    });

    describe('UTC-12: updateMemberStatus', () => {
        test('UTC-12-01: updates member status successfully', async () => {
            pool.query.mockResolvedValue({
                rows: [{ trip_id: 1, created_by: 1, trip_status: 'Upcoming' }],
            });
            const updatedMember = { participantId: 1, tripId: 1, memberStatus: 'Participating' };
            daoMock.updateStatus.mockResolvedValue(updatedMember);

            const result = await tripMemberService.updateMemberStatus(
                1, 1, { memberStatus: 'Participating' }, 1,
            );

            expect(daoMock.updateStatus).toHaveBeenCalledWith(1, 'Participating');
            expect(result).toEqual(updatedMember);
        });

        test('UTC-12-02: throws an error when trip is not found', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(
                tripMemberService.updateMemberStatus(0, 1, { memberStatus: 'Participating' }, 1),
            ).rejects.toThrow('Trip not found');
            expect(daoMock.updateStatus).not.toHaveBeenCalled();
        });

        test('UTC-12-03: throws an error when requester is not the trip owner', async () => {
            pool.query.mockResolvedValue({
                rows: [{ trip_id: 1, created_by: 1, trip_status: 'Upcoming' }],
            });

            await expect(
                tripMemberService.updateMemberStatus(1, 1, { memberStatus: 'Participating' }, 3),
            ).rejects.toThrow('Only the trip owner can edit members');
            expect(daoMock.updateStatus).not.toHaveBeenCalled();
        });

        test('UTC-12-04: throws an error when trip status is not Upcoming', async () => {
            pool.query.mockResolvedValue({
                rows: [{ trip_id: 1, created_by: 1, trip_status: 'Active' }],
            });

            await expect(
                tripMemberService.updateMemberStatus(1, 1, { memberStatus: 'Participating' }, 1),
            ).rejects.toThrow('Can only edit members of Upcoming trips');
            expect(daoMock.updateStatus).not.toHaveBeenCalled();
        });
    });

    describe('UTC-13: removeMember', () => {
        test('UTC-13-01: removes a member successfully', async () => {
            pool.query.mockResolvedValue({
                rows: [{ trip_id: 1, created_by: 1, trip_status: 'Upcoming' }],
            });
            const deletedMember = { participantId: 1, tripId: 1 };
            daoMock.delete.mockResolvedValue(deletedMember);

            const result = await tripMemberService.removeMember(1, 1, 1);

            expect(daoMock.delete).toHaveBeenCalledWith(1);
            expect(result).toEqual(deletedMember);
        });

        test('UTC-13-02: throws an error when trip is not found', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(tripMemberService.removeMember(1, 1, 1))
                .rejects.toThrow('Trip not found');
            expect(daoMock.delete).not.toHaveBeenCalled();
        });

        test('UTC-13-03: throws an error when requester is not the trip owner', async () => {
            pool.query.mockResolvedValue({
                rows: [{ trip_id: 1, created_by: 2, trip_status: 'Upcoming' }],
            });

            await expect(tripMemberService.removeMember(1, 1, 1))
                .rejects.toThrow('Only the trip owner can remove members');
            expect(daoMock.delete).not.toHaveBeenCalled();
        });

        test('UTC-13-04: throws an error when trip status is not Upcoming', async () => {
            pool.query.mockResolvedValue({
                rows: [{ trip_id: 1, created_by: 1, trip_status: 'Active' }],
            });

            await expect(tripMemberService.removeMember(1, 1, 1))
                .rejects.toThrow('Can only remove members from Upcoming trips');
            expect(daoMock.delete).not.toHaveBeenCalled();
        });
    });
});