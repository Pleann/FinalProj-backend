const express            = require('express');
const LocationController = require('./tripLocation.controller');

const router             = express.Router({ mergeParams: true });
const locationController = new LocationController();

router.post('/start',    (req, res) => locationController.confirmStart(req, res));
router.get('/start',     (req, res) => locationController.getStart(req, res));
router.post('/',         (req, res) => locationController.saveLocation(req, res));
router.get('/latest',    (req, res) => locationController.getLatestLocations(req, res));
router.post('/attendance/evaluate', (req, res) => locationController.evaluateAttendance(req, res));
router.get('/attendance',           (req, res) => locationController.getAttendance(req, res));

module.exports = router;