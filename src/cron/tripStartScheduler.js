const cron = require('node-cron');
const LocationService = require('../features/tripLocation/tripLocation.service');

const locationService = new LocationService();

cron.schedule('* * * * *', async () => {
    try {
        await locationService.findAndStartDueTrips();
    } catch (err) {
        console.error('Trip start scheduler run failed:', err);
    }
});