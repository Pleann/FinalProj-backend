const express                = require('express');
const TripActivityController = require('./tripActivity.controller');

const router             = express.Router({ mergeParams: true });
const activityController = new TripActivityController();

router.post('/stops',                        (req, res) => activityController.confirmStop(req, res));
router.get('/stops',                         (req, res) => activityController.getStops(req, res));
router.get('/stops/:stopId',                 (req, res) => activityController.getActivityByStop(req, res));
router.post('/stops/:stopId/enrich',         (req, res) => activityController.createActivityFromStop(req, res));
router.post('/detect-place',                 (req, res) => activityController.detectPlaceType(req, res));
router.get('/timeline',                      (req, res) => activityController.getTimeline(req, res));

module.exports = router;