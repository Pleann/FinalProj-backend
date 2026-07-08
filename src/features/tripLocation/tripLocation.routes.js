const express            = require('express');
const LocationController = require('./tripLocation.controller');

const router             = express.Router({ mergeParams: true });
const locationController = new LocationController();

router.post('/',         (req, res) => locationController.saveLocation(req, res));
router.get('/latest',    (req, res) => locationController.getLatestLocations(req, res));

module.exports = router;