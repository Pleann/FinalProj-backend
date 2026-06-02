const express = require('express');
const TripController = require('./trip.controller');
const upload = require('../../middleware/upload.middleware');

const router = express.Router();
const tripController = new TripController();

router.get('/', (req, res) => tripController.getAllTrips(req, res));
router.post('/', upload.single('image'), (req, res) => tripController.createTrip(req, res));
router.patch('/:tripId', upload.single('image'), (req, res) => tripController.updateTrip(req, res));
router.get('/status/upcoming', (req, res) => tripController.getUpcomingTrips(req, res));
router.get('/status/active', (req, res) => tripController.getActiveTrips(req, res));
router.get('/status/completed', (req, res) => tripController.getCompletedTrips(req, res));
router.patch('/:tripId/status', (req, res) => tripController.updateTripStatus(req, res));
router.delete('/:tripId', (req, res) => tripController.deleteTrip(req, res));


module.exports = router;