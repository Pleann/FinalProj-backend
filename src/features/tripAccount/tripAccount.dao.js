const pool = require('../../config/db');
const {AccountEntity, AccountTripEntity, AccountAwardEntity} = require('./tripAccount.entity');

class TripAccountDao {
    async insertAccount(a) {
        const { rows } = await pool.query(
            `INSERT INTO Account (first_name, last_name, username, email, password, profile_picture_url)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [a.firstName, a.lastName, a.username, a.email, a.password, a.profilePictureUrl ?? null]
        );
        return new AccountEntity(rows[0]);
    }

    async updateAccount(userId, firstName, lastName, username, email, password, profilePictureUrl) {
        const { rows } = await pool.query(
            `UPDATE Account
         SET first_name  = COALESCE($1, first_name),
             last_name   = COALESCE($2, last_name),
             username    = COALESCE($3, username),
             email       = COALESCE($4, email),
             password    = COALESCE($5, password),
             profile_picture_url = COALESCE($6, profile_picture_url)
         WHERE user_id = $7
         RETURNING *`,
            [
                firstName ?? null,
                lastName ?? null,
                username ?? null,
                email ?? null,
                password ?? null,
                profilePictureUrl ?? null,
                userId
            ]
        );
        if (rows.length === 0) throw new Error('Trip account not found');
        return new AccountEntity(rows[0]);
    }

    async findAuthByUsername(username) {
        const { rows } = await pool.query(
            `SELECT * FROM Account WHERE username = $1`,
            [username]
        );
        return rows[0] || null;
    }

    async findAccountById(userId) {
        const {rows} = await pool.query(
            `SELECT * FROM Account WHERE user_id = $1`,
            [userId]
        );
        if (rows.length === 0) throw new Error('Trip account not found');
        return new AccountEntity(rows[0]);
    }

    async findAllAccounts() {
        const {rows} = await pool.query(
            `SELECT * FROM Account`
        );
        return rows.map(row => new AccountEntity(row));
    }

    async findTripsByAccount(userId) {
        const { rows } = await pool.query(
            `SELECT a.user_id,
                tm.attendance,
                t.trip_id,
                t.trip_name,
                t.trip_start_time,
                t.trip_status
         FROM Account a
         JOIN TripMember tm ON tm.user_id = a.user_id
         JOIN Trip t ON t.trip_id = tm.trip_id
         WHERE a.user_id = $1
         ORDER BY t.trip_start_time DESC`,
            [userId]
        );
        return rows.map(row => new AccountTripEntity(row));
    }

    async usernameExists(username) {
        const { rows } = await pool.query(
            `SELECT 1 FROM Account WHERE username = $1 LIMIT 1`,
            [username]
        );
        return rows.length > 0;
    }

    async emailExists(email) {
        const { rows } = await pool.query(
            `SELECT 1 FROM Account WHERE email = $1 LIMIT 1`,
            [email]
        );
        return rows.length > 0;
    }

    async findAwardsByUserId(userId) {
        const { rows } = await pool.query(
            `SELECT ta.award_id,
                ta.trip_id,
                t.trip_name,
                ta.award_name,
                ta.award_description
         FROM TripAward ta
         JOIN Trip t ON t.trip_id = ta.trip_id
         WHERE ta.user_id = $1
         ORDER BY ta.award_id DESC`,
            [userId]
        );
        return rows.map(row => new AccountAwardEntity(row));
    }

    async deleteAccount(userId) {
        const {rows} = await pool.query(
            `DELETE FROM Account WHERE user_id = $1 RETURNING *`,
            [userId]
        );
        if (rows.length === 0) throw new Error('Trip account not found');
        return new AccountEntity(rows[0]);
    }
}

module.exports = TripAccountDao;