class AccountEntity {
    constructor(row) {
        this.userId = row.user_id;
        this.firstName = row.first_name;
        this.lastName = row.last_name;
        this.username = row.username;
        this.email = row.email;
        this.password = row.password;
        this.reliabilityScore = row.reliability_score;
        this.profilePicture = row.profile_picture_url;
    }
}

class AccountTripEntity {
    constructor(row) {
        this.userId = row.user_id;
        this.tripId = row.trip_id;
        this.tripName = row.trip_name;
        this.startTime = row.trip_start_time;
        this.attendance = row.attendance;
    }
}
module.exports = {AccountEntity, AccountTripEntity};
//                                        user_id          SERIAL PRIMARY KEY,
//                                        first_name       VARCHAR(255) NOT NULL,
//                                        last_name        VARCHAR(255) NOT NULL,
//                                        username         VARCHAR(255) NOT NULL,
//                                        email            VARCHAR(255) NOT NULL,
//                                        password         TEXT NOT NULL,          -- stores bcrypt hash, never plain text
//                                        reliability_score  NUMERIC(5,2) DEFAULT 200.00