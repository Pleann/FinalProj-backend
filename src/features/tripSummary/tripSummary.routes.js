const express = require('express');
const TripSummaryController = require('./tripSummary.controller');
const upload = require('../../middleware/upload.middleware');

const router = express.Router({ mergeParams: true });
const tripSummaryController = new TripSummaryController();
const authenticate = require('../../middleware/auth.middleware');

router.post('/:tripId/photo', authenticate, upload.single('photo'), (req, res) => tripSummaryController.savePhoto(req, res));
router.get('/photos', (req, res) => tripSummaryController.getPhotosByTrip(req, res));
router.delete('/photo/:photoId', (req, res) => tripSummaryController.deletePhoto(req, res));
router.get('/awards', (req, res) => tripSummaryController.getAwardsByTrip(req, res));
router.get('/summary', (req, res) => tripSummaryController.getSummaryByTrip(req, res));
router.get('/activityGraphTrip', (req, res) => tripSummaryController.getActivityGraphDataByTrip(req, res));
router.get('/activityGraphUser', authenticate,(req, res) => tripSummaryController.getActivityGraphDataByUser(req, res));
router.get('/story', (req, res) => tripSummaryController.getStoryData(req, res));

module.exports = router;

///api/trips/:tripId/summary/awards