const express = require('express');
const TripInviteController = require('./tripInvite.controller');

const router = express.Router({ mergeParams: true }); // mergeParams to access tripId
const tripInviteController = new TripInviteController();

router.get('/', (req, res) => tripInviteController.getInvitesByTrip(req, res));
router.post('/', (req, res) => tripInviteController.sendInvite(req, res));
router.patch('/:tripInviteId', (req, res) => tripInviteController.respondToInvite(req, res));

module.exports = router;