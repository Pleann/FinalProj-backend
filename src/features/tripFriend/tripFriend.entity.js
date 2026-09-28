class FriendEntity {
    constructor(rows) {
        this.friendId = rows.friend_id;
        this.userId = rows.user_id;
        this.friendUserId = rows.friend_user_id;
        this.friendStatus = rows.friend_status;
    }
}

class FriendRequestEntity {
    constructor(rows) {
        this.requestId = rows.request_id;
        this.senderId = rows.sender_id;
        this.receiverId = rows.receiver_id;
        this.requestStatus = rows.request_status;
        this.sentAt = rows.sent_at;
    }
}

class RecommendedFriendEntity {
    constructor(row) {
        this.userId = row.user_id;
        this.firstName = row.first_name;
        this.lastName = row.last_name;
        this.username = row.username;
        this.profilePicture = row.profile_picture_url;
        this.sharedTrips = parseInt(row.shared_trips, 10); // COUNT returns a string in pg
    }
}

module.exports = { FriendEntity, FriendRequestEntity, RecommendedFriendEntity };

// CREATE TABLE IF NOT EXISTS Friend (
//     friend_id        SERIAL PRIMARY KEY,
//     user_id          INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
//     friend_user_id   INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
//     -- status           member_status default 'Undecided',
//
//     CONSTRAINT unique_friendship UNIQUE (user_id, friend_user_id)
// );
//
// CREATE TABLE IF NOT EXISTS FriendRequest (
//     request_id       SERIAL PRIMARY KEY,
//     sender_id        INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
//     receiver_id      INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
//     status           member_status default 'Undecided',
//
//     CONSTRAINT unique_friend_request UNIQUE (sender_id, receiver_id)
// );