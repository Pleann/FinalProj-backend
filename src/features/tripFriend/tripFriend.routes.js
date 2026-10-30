const express = require('express');
const TripFriendController = require('./tripFriend.controller');

const router = express.Router({ mergeParams: true })
const tripFriendController = new TripFriendController();
const authenticate = require('../../middleware/auth.middleware');

router.use(authenticate);

router.post('/sendRequest', (req, res) => tripFriendController.sendRequest(req, res));
router.get('/friend/:friendId', (req, res) => tripFriendController.getFriendById(req, res));
router.get('/request/:requestId', (req, res) => tripFriendController.getRequestById(req, res));
router.get('/allFriends', (req, res) => tripFriendController.getAllFriends(req, res));
router.get('/allRequests', (req, res) => tripFriendController.getAllRequests(req, res));
router.patch('/friend/:friendId', (req, res) => tripFriendController.updateFriendStatus(req, res));
router.patch('/request/:requestId', (req, res) => tripFriendController.updateRequestStatus(req, res));
router.get('/recommendations', (req, res) => tripFriendController.getRecommendedFriends(req, res));
router.get('/search', (req, res) => tripFriendController.getUserByNameFirstName(req, res));

module.exports = router;