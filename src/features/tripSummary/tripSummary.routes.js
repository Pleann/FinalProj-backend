const express = require('express');
const TripSummaryController = require('./tripSummary.controller');
const upload = require('../../middleware/upload.middleware');

const router = express.Router({ mergeParams: true });
const tripSummaryController = new TripSummaryController();

router.post('/photo', upload.single('photo'), (req, res) => tripSummaryController.savePhoto(req, res));
router.get('/photos', (req, res) => tripSummaryController.getPhotosByTrip(req, res));

module.exports = router;