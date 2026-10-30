const TripFriendDao = require('./tripFriend.dao');

//add error catching!!
class TripFriendService {
    constructor() {
        this.tripFriendDao = new TripFriendDao();
    }

    async sendRequest(senderId, receiverId) {
        const request = await this.tripFriendDao.insertRequest(
            senderId,
            receiverId
        );

        if (!request) {
            throw new Error('Unable to send friend request');
        }

        return request;
    }

    async getFriendById(friendId) {
        if (!friendId) {
            throw new Error('Friend ID is required');
        }

        const friend = await this.tripFriendDao.findFriendById(friendId);

        if (!friend) {
            throw new Error('Friendship not found');
        }

        return friend;
    }

    async getRequestById(requestId) {
        if (!requestId) {
            throw new Error('Request ID is required');
        }

        const request = await this.tripFriendDao.findRequestById(requestId);

        if (!request) {
            throw new Error('Friend request not found');
        }

        return request;
    }

    async getAllFriends(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const friends = await this.tripFriendDao.findAllFriends(userId);

        if (!friends) {
            throw new Error('Unable to load friends. Please try again.');
        }

        return friends;
    }

    async getAllRequests(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const requests = await this.tripFriendDao.findAllRequests(userId);

        if (!requests) {
            throw new Error('Unable to load friend requests. Please try again.');
        }

        return requests;
    }

    async updateFriendStatus(friendId, status) {
        if (!friendId) {
            throw new Error('Friend ID is required');
        }

        if (!status) {
            throw new Error('Friendship status is required');
        }

        const allowedStatuses = ['accepted', 'denied'];

        if (!allowedStatuses.includes(status)) {
            throw new Error('Invalid friendship status');
        }

        const friend = await this.tripFriendDao.updateFriendStatus(
            friendId,
            status
        );

        if (!friend) {
            throw new Error('Friendship not found');
        }

        return friend;
    }

    async updateRequestStatus(requestId, status, userId) {
        console.log('SERVICE UPDATE REQUEST:', {
            requestId,
            status,
            userId
        });

        if (!requestId) {
            throw new Error('Request ID is required');
        }

        const allowed = ['accepted', 'denied'];

        console.log('STATUS CHECK:', {
            status,
            allowed,
            isAllowed: allowed.includes(status),
        });

        if (!allowed.includes(status)) {
            throw new Error('Invalid status');
        }

        const existing = await this.tripFriendDao.findRequestById(requestId);

        console.log('EXISTING REQUEST:', existing);

        if (!existing) {
            throw new Error('Request not found');
        }

        console.log('RECIPIENT CHECK:', {
            receiverId: existing.receiverId,
            loggedInUserId: userId,
        });

        if (String(existing.receiverId) !== String(userId)) {
            throw new Error('Only the recipient can respond to this request');
        }

        return this.tripFriendDao.updateRequestStatus(requestId, status);
    }

    async getRecommendedFriends(userId, limit = 10) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const friends = await this.tripFriendDao.findRecommendedFriends(
            userId,
            Math.min(limit, 50)
        );

        if (!friends) {
            throw new Error('Unable to load friend recommendations. Please try again.');
        }

        return friends;
    }

    async getUserByNameFirstName(userId, query) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const term = (query || '').trim();

        if (term.length < 2) {
            throw new Error('Search must be at least 2 characters');
        }

        const users = await this.tripFriendDao.findUsersByNameOrFirstName(
            userId,
            term
        );

        if (!users) {
            throw new Error('Unable to search users. Please try again.');
        }

        return users;
    }
}

module.exports = TripFriendService;