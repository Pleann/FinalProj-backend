const pool = require('../../config/db');
const {AccountEntity, AccountTripEntity, AccountAwardEntity, LeaderboardEntity} = require('./tripAccount.entity');

class TripAccountDao {
    async insertAccount(tripAccount) {
        const { rows } = await pool.query(
            `INSERT INTO Account (first_name, last_name, username, email, password, profile_picture_url)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [tripAccount.firstName, tripAccount.lastName, tripAccount.username, tripAccount.email, tripAccount.password, tripAccount.profilePictureUrl ?? null]
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

    async getLeaderboard(limit) {
        const { rows } = await pool.query(
            `SELECT user_id, first_name, last_name, username, profile_picture_url, reliability_score
            FROM Account
            ORDER BY reliability_score DESC
            LIMIT $1`,
            [limit]
        );
        return rows.map(row => new LeaderboardEntity(row));
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
                t.trip_start_date,
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

    // Find an account using its email address
    async findAccountByEmail(email) {
        const { rows } = await pool.query(
            `SELECT user_id, email
         FROM Account
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
            [email]
        );

        return rows[0] || null;
    }

// Retrieve the current OTP reset information for an account
    async findPasswordResetByEmail(email) {
        const { rows } = await pool.query(
            `SELECT
            user_id,
            email,
            reset_otp_hash,
            reset_otp_expires_at,
            reset_otp_attempts
         FROM Account
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
            [email]
        );

        return rows[0] || null;
    }

// Save a new OTP hash and its expiration time
    async savePasswordResetOtp(userId, otpHash, expiresAt) {
        const { rows } = await pool.query(
            `UPDATE Account
         SET reset_otp_hash = $1,
             reset_otp_expires_at = $2,
             reset_otp_attempts = 0,
             reset_verified_token_hash = NULL,
             reset_verified_expires_at = NULL
         WHERE user_id = $3
         RETURNING user_id`,
            [otpHash, expiresAt, userId]
        );

        return rows.length > 0;
    }

// Increment OTP attempts, provided the OTP is still valid
// and the maximum number of attempts has not been reached
    async incrementPasswordResetAttempts(userId) {
        const { rows } = await pool.query(
            `UPDATE Account
         SET reset_otp_attempts = reset_otp_attempts + 1
         WHERE user_id = $1
           AND reset_otp_hash IS NOT NULL
           AND reset_otp_expires_at > NOW()
           AND reset_otp_attempts < 5
         RETURNING reset_otp_attempts`,
            [userId]
        );

        return rows[0]?.reset_otp_attempts ?? null;
    }

// Save a verified reset token and invalidate the OTP
    async saveVerifiedResetToken(userId, otpHash, tokenHash, expiresAt) {
        const { rows } = await pool.query(
            `UPDATE Account
         SET reset_verified_token_hash = $1,
             reset_verified_expires_at = $2,
             reset_otp_hash = NULL,
             reset_otp_expires_at = NULL,
             reset_otp_attempts = 0
         WHERE user_id = $3
           AND reset_otp_hash = $4
           AND reset_otp_expires_at > NOW()
           AND reset_otp_attempts < 5
         RETURNING user_id`,
            [tokenHash, expiresAt, userId, otpHash]
        );

        return rows.length > 0;
    }

// Update the password using a valid reset token and clear reset data
    async updatePasswordAndClearReset(tokenHash, hashedPassword) {
        const { rows } = await pool.query(
            `UPDATE Account
         SET password = $1,
             reset_otp_hash = NULL,
             reset_otp_expires_at = NULL,
             reset_otp_attempts = 0,
             reset_verified_token_hash = NULL,
             reset_verified_expires_at = NULL
         WHERE reset_verified_token_hash = $2
           AND reset_verified_expires_at > NOW()
         RETURNING user_id`,
            [hashedPassword, tokenHash]
        );

        return rows.length > 0;
    }
}

module.exports = TripAccountDao;