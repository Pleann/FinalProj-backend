const express                = require('express');
const TripActivityController = require('./tripActivity.controller');

const router             = express.Router({ mergeParams: true });
const activityController = new TripActivityController();

router.get('/timeline',                      (req, res) => activityController.getTimeline(req, res));
router.get('/actitiesAmount', (req, res) => activityController.getActivityTypeCounts(req, res));

module.exports = router;