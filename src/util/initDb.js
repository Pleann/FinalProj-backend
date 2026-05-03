const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const initDb = async () => {
    const sql = fs.readFileSync(
        path.join(__dirname, '../../resources/database/database.sql'),
        'utf8'
    );
    await pool.query(sql);
    console.log('✅ Database initialized');
};

module.exports = initDb;