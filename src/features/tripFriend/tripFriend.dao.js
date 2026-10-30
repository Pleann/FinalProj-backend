const pool = require('../../config/db');
const { FriendEntity, FriendRequestEntity, RecommendedFriendEntity } = require('./tripFriend.entity');

class TripFriendDao {
    async insertRequest(senderId, receiverId) {
        const { rows } = await pool.query(
            `INSERT INTO FriendRequest (sender_id, receiver_id)
             VALUES ($1, $2)
             RETURNING *`,
            [senderId, receiverId]
        );

        return new FriendRequestEntity(rows[0]);
    }

    async findFriendById(friendId) {
        const { rows } = await pool.query(
            `SELECT * FROM Friend WHERE friend_id = $1`,
            [friendId]
        );
        if (rows.length === 0) throw new Error('Friend not found');

        return new FriendEntity(rows[0]);
    }

    async findRequestById(requestId) {
    console.log('FIND REQUEST BY ID:', requestId);

    const { rows } = await pool.query(
        `SELECT *
         FROM FriendRequest
         WHERE request_id = $1`,
        [requestId]
    );

    console.log('FIND REQUEST RESULT:', rows);

    if (rows.length === 0) {
        return null;
    }

    return new FriendRequestEntity(rows[0]);
}

    async findAllFriends(userId) {
        const { rows } = await pool.query(
            `SELECT
                f.friend_id,
                f.user_id,
                f.friend_user_id,
                f.friend_status,
                a.user_id AS friend_account_id,
                a.username,
                a.profile_picture_url
            FROM Friend f
            JOIN Account a
            ON a.user_id = CASE
                    WHEN f.user_id = $1 THEN f.friend_user_id
                    ELSE f.user_id
                END
            WHERE f.user_id = $1
                OR f.friend_user_id = $1`,
            [userId]
        );

        if (rows.length === 0) {
            throw new Error('Friend not found');
        }

        return rows.map(row => ({
            friendId: row.friend_id,
            userId: row.user_id,
            friendUserId: row.friend_user_id,
            friendStatus: row.friend_status,
            friendAccountId: row.friend_account_id,
            username: row.username,
            profilePicture: row.profile_picture_url,
        }));
    }

    async findAllRequests(userId) {
        const { rows } = await pool.query(
            `SELECT *
            FROM FriendRequest
            WHERE sender_id = $1
                OR receiver_id = $1`,
            [userId]
        );

        if (rows.length === 0) {
            throw new Error('Friend request not found');
        }

        return rows.map(
            row => new FriendRequestEntity(row)
        );
    }

    async updateFriendStatus(friendId, status) {
        const { rows } = await pool.query(
            `UPDATE Friend SET friend_status = $1 WHERE friend_id = $2 RETURNING *`,
            [status, friendId]
        );

        return new FriendEntity(rows[0]);
    }

    async updateRequestStatus(requestId, status) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            console.log('UPDATE FRIEND REQUEST:', {
                requestId,
                status,
            });

            const { rows } = await client.query(
                `UPDATE FriendRequest
                SET request_status = $1
                WHERE request_id = $2
                RETURNING *`,
                [status, requestId]
            );

            console.log('UPDATED ROWS:', rows);

            if (rows.length === 0) {
                throw new Error('Friend request not found');
            }

            const request = new FriendRequestEntity(rows[0]);

            let friend = null;

            if (status === 'accepted') {
                const { rows: friendRows } = await client.query(
                    `INSERT INTO Friend (user_id, friend_user_id)
                    SELECT $1, $2
                    WHERE NOT EXISTS (
                        SELECT 1 FROM Friend
                        WHERE (user_id = $1 AND friend_user_id = $2)
                            OR (user_id = $2 AND friend_user_id = $1)
                    )
                    RETURNING *`,
                    [request.senderId, request.receiverId]
                );

                if (friendRows.length > 0) {
                    friend = new FriendEntity(friendRows[0]);
                }
            }

            await client.query('COMMIT');

            return {
                request,
                friend,
            };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async findRecommendedFriends(userId, limit) {
        const { rows } = await pool.query(
            `SELECT a.user_id,
                a.first_name,
                a.last_name,
                a.username,
                a.profile_picture_url,
                COUNT(DISTINCT other.trip_id) AS shared_trips
         FROM TripMember me
         JOIN TripMember other
              ON other.trip_id = me.trip_id
             AND other.user_id <> me.user_id
         JOIN Account a ON a.user_id = other.user_id
         WHERE me.user_id = $1
           AND NOT EXISTS (
               SELECT 1 FROM Friend f
               WHERE (f.user_id = $1 AND f.friend_user_id = other.user_id)
                  OR (f.user_id = other.user_id AND f.friend_user_id = $1)
           )
           AND NOT EXISTS (
               SELECT 1 FROM FriendRequest r
               WHERE (r.sender_id = $1 AND r.receiver_id = other.user_id)
                  OR (r.sender_id = other.user_id AND r.receiver_id = $1)
           )
         GROUP BY a.user_id, a.first_name, a.last_name, a.username, a.profile_picture_url
         ORDER BY shared_trips DESC, a.username ASC
         LIMIT $2`,
            [userId, limit]
        );
        return rows.map(row => new RecommendedFriendEntity(row));
    }

    async findUsersByNameOrFirstName(userId, term) {
        // Escape LIKE wildcards so "%" or "_" typed by the user are treated literally
        const escaped = term.replace(/[\\%_]/g, '\\$&');

        const { rows } = await pool.query(
            `SELECT a.user_id, a.first_name, a.last_name, a.username, a.profile_picture_url
             FROM Account a
             WHERE a.user_id <> $1
               AND (a.username ILIKE $2 OR a.first_name ILIKE $2)
             ORDER BY (LOWER(a.username) = LOWER($3)) DESC,
                      a.username ASC
                 LIMIT 20`,
            [userId, `${escaped}%`, term]
        );

        return rows.map(row => new RecommendedFriendEntity(row));
    }
}

module.exports = TripFriendDao;