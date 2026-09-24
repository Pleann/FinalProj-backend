const pool = require('../../config/db');
const TripAccountEntity = require('./tripAccount.entity');

class TripAccountDao {
    async insertAccount(tripAccount) {
        const {rows} = await pool.query(
            `INSERT INTO Account (first_name, last_name, username, email, password)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [tripAccount.firstName, tripAccount.lastName, tripAccount.username, tripAccount.email, tripAccount.password]
        );
        return new TripAccountEntity(rows[0]);
    }

    async updateAccount(userId, fields) {
        const keys = Object.keys(fields);
        const values = Object.values(fields);

        // Dynamically build SET clause: "first_name = $1, last_name = $2 ..."
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        values.push(userId); // last placeholder for WHERE

        const {rows} = await pool.query(
            `UPDATE Account
             SET ${setClause}
             WHERE user_id = $${values.length} RETURNING *`,
            values
        );
        if (rows.length === 0) throw new Error('Trip account not found');
        return new TripAccountEntity(rows[0]);
    }

    async findAccountById(userId) {
        const {rows} = await pool.query(
            `SELECT * FROM Account WHERE user_id = $1`,
            [userId]
        );
        if (rows.length === 0) throw new Error('Trip account not found');
        return new TripAccountEntity(rows[0]);
    }

    async findAllAccounts() {
        const {rows} = await pool.query(
            `SELECT * FROM Account`
        );
        return rows.map(row => new TripAccountEntity(row));
    }

    async deleteAccount(userId) {
        const {rows} = await pool.query(
            `DELETE FROM Account WHERE user_id = $1 RETURNING *`,
            [userId]
        );
        if (rows.length === 0) throw new Error('Trip account not found');
        return new TripAccountEntity(rows[0]);
    }
}

module.exports = TripAccountDao;