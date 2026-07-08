// cron/attendanceScheduler.js
const cron = require('node-cron');
const LocationService = require('../features/tripLocation/tripLocation.service');

const locationService = new LocationService();

cron.schedule('*/3 * * * *', async () => { // every 3 minutes
    try {
        await locationService.checkDueAttendance();
    } catch (err) {
        console.error('Attendance check scheduler run failed:', err);
    }
});