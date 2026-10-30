const TripFriendService = require('./tripFriend.service');

class TripFriendController {
    constructor() {
        this.tripFriendService = new TripFriendService();
    }

    async sendRequest(req, res) {
        try {
            const senderId = req.user.userId;
            const { receiverId } = req.body;
            const request = await this.tripFriendService.sendRequest(senderId, receiverId);
            res.status(201).json({ message: 'Friend request sent successfully', request });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async getFriendById(req, res) {
        try {
            const { friendId } = req.params;
            const friend = await this.tripFriendService.getFriendById(friendId);
            res.status(200).json(friend);
        } catch (err) {
            res.status(404).json({ error: err.message });
        }
    }

    async getRequestById(req, res) {
        try {
            const { requestId } = req.params;
            const request = await this.tripFriendService.getRequestById(requestId);
            res.status(200).json(request);
        } catch (err) {
            res.status(404).json({ error: err.message });
        }
    }

    async getAllFriends(req, res) {
        try {
            const friends = await this.tripFriendService.getAllFriends(req.user.userId);
            res.status(200).json(friends);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getAllRequests(req, res) {
        try {
            const requests = await this.tripFriendService.getAllRequests(req.user.userId);
            res.status(200).json(requests);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async updateFriendStatus(req, res) {
        try {
            const { friendId } = req.params;
            const { status } = req.body;
            const updatedFriend = await this.tripFriendService.updateFriendStatus(friendId, status);
            res.status(200).json({ message: 'Friend status updated successfully', updatedFriend });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async updateRequestStatus(req, res) {
        try {
            const { requestId } = req.params;
            const { status } = req.body;
            const { request, friend } = await this.tripFriendService.updateRequestStatus(requestId, status, req.user.userId);
            res.status(200).json({ message: 'Request status updated successfully', updatedRequest: request, friend });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async getRecommendedFriends(req, res) {
        try {
            const limit = parseInt(req.query.limit, 10) || 10;
            const recommendations = await this.tripFriendService.getRecommendedFriends(req.user.userId, limit);
            res.status(200).json(recommendations);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async getUserByNameFirstName(req, res) {
        try {
            const { q } = req.query;
            const users = await this.tripFriendService.getUserByNameFirstName(req.user.userId, q);
            res.status(200).json(users);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}

module.exports = TripFriendController;