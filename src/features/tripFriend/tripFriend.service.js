const TripFriendDao = require('./tripFriend.dao');

//add error catching!!
class TripFriendService {
    constructor() {
        this.tripFriendDao = new TripFriendDao();
    }

    async sendRequest(senderId, receiverId) {
        return this.tripFriendDao.insertRequest(senderId, receiverId);
    }

    async getFriendById(friendId) {
        return await this.tripFriendDao.findFriendById(friendId);
    }

    async getRequestById(requestId) {
        return await this.tripFriendDao.findRequestById(requestId);
    }

    async getAllFriends(userId) {
        return await this.tripFriendDao.findAllFriends(userId);
    }

    async getAllRequests(userId) {
        return await this.tripFriendDao.findAllRequests(userId);
    }

    async updateFriendStatus(friendId, status) {
        return this.tripFriendDao.updateFriendStatus(friendId, status);
    }

    async updateRequestStatus(requestId, status, userId) {
        if (!requestId) throw new Error('Request ID is required');
        const allowed = ['accepted', 'declined'];
        if (!allowed.includes(status)) throw new Error('Invalid status');

        const existing = await this.tripFriendDao.findRequestById(requestId);
        if (!existing) throw new Error('Request not found');
        if (String(existing.receiverId) !== String(userId)) {
            throw new Error('Only the recipient can respond to this request');
        }

        return this.tripFriendDao.updateRequestStatus(requestId, status);
    }

    async getRecommendedFriends(userId, limit = 10) {
        if (!userId) throw new Error('User ID is required');
        return this.tripFriendDao.findRecommendedFriends(userId, Math.min(limit, 50));
    }

    async getUserByNameFirstName(userId, query) {
        if (!userId) throw new Error('User ID is required');
        const term = (query || '').trim();
        if (term.length < 2) throw new Error('Search must be at least 2 characters');
        return await this.tripFriendDao.findUsersByNameOrFirstName(userId, term);
    }
}

module.exports = TripFriendService;