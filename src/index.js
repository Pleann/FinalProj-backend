require('dotenv').config();
const app = require('./app');
const initDb = require('./util/initDb');

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await initDb();

        require('./cron/tripStartScheduler');
        require('./cron/attendanceScheduler');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
        });
    } catch (err) {
        console.error('❌ Failed to start:', err);
        process.exit(1);
    }
};

start();