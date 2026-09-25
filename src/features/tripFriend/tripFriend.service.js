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

    async updateRequestStatus(requestId, status) {
        return this.tripFriendDao.updateRequestStatus(requestId, status);
    }
}

module.exports = TripFriendService;