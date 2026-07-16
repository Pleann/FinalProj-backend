jest.mock('../tripNotification.dao');

const TripNotificationService = require('../tripNotification.service');
const TripNotificationDao = require('../tripNotification.dao');

describe('tripNotificationService', () => {
    let tripNotificationService;
    let daoMock;

    beforeEach(() => {
        tripNotificationService = new TripNotificationService();
        daoMock = TripNotificationDao.mock.instances[0];
    });

    describe('UTC-24: getNotifications', () => {
        test('UTC-24-01: retrieves notifications successfully for a valid user', async () => {
            const notifications = [{ notificationId: 1, userId: 1, title: 'TripInvite' }];
            daoMock.findByUser.mockResolvedValue(notifications);

            const result = await tripNotificationService.getNotifications(1);

            expect(daoMock.findByUser).toHaveBeenCalledWith(1);
            expect(result).toEqual(notifications);
        });

        test('UTC-24-02: throws an error when userId is invalid/not found', async () => {
            daoMock.findByUser.mockRejectedValue(new Error('Invalid user'));

            await expect(tripNotificationService.getNotifications(null))
                .rejects.toThrow('Failed to fetch notifications for user null: Invalid user');
        });
    });

    describe('UTC-25: deleteNotification', () => {
        test('UTC-25-01: deletes notification successfully', async () => {
            const deleted = { notificationId: 1 };
            daoMock.delete.mockResolvedValue(deleted);

            const result = await tripNotificationService.deleteNotification(1);

            expect(daoMock.delete).toHaveBeenCalledWith(1);
            expect(result).toEqual(deleted);
        });

        test('UTC-25-02: throws a wrapped error when notificationId is null/invalid', async () => {
            daoMock.delete.mockRejectedValue(new Error('Invalid notification ID'));

            await expect(tripNotificationService.deleteNotification(null))
                .rejects.toThrow('Failed to delete notification null: Invalid notification ID');
        });
    });
});