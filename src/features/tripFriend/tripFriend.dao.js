const pool = require('../../config/db');
const { TripFriendEntity } = require('./tripFriend.entity');
const { FriendRequestEntity } = require('./tripFriend.entity');

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

        return new TripFriendEntity(rows[0]);
    }

    async findRequestById(requestId) {
        const { rows } = await pool.query(
            `SELECT * FROM FriendRequest WHERE request_id = $1`,
            [requestId]
        );

        return new FriendRequestEntity(rows[0]);
    }

    async findAllFriends() {
        const { rows } = await pool.query(`SELECT * FROM Friend`);

        return rows.map(row => new TripFriendEntity(row));
    }

    async findAllRequests() {
        const { rows } = await pool.query(`SELECT * FROM FriendRequest`);

        return rows.map(row => new FriendRequestEntity(row));
    }

    async updateFriendStatus(friendId, status) {
        const { rows } = await pool.query(
            `UPDATE Friend SET friend_status = $1 WHERE friend_id = $2 RETURNING *`,
            [status, friendId]
        );

        return new TripFriendEntity(rows[0]);
    }

    async updateRequestStatus(requestId, status) {
        const { rows } = await pool.query(
            `UPDATE FriendRequest SET request_status = $1 WHERE request_id = $2 RETURNING *`,
            [status, requestId]
        );

        return new FriendRequestEntity(rows[0]);
    }
}

module.exports = TripFriendDao;