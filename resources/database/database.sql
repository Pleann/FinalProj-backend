CREATE TYPE trip_status AS ENUM ('Upcoming', 'Active', 'Completed');
CREATE TYPE member_status AS ENUM ('Participating','Not_participating','Cancelled','Undecided')
CREATE TYPE invite_status AS ENUM ('Accept','Reject','Cancelled','Undecided')

CREATE TABLE IF NOT EXISTS Trip (
                                    trip_id          SERIAL PRIMARY KEY,
                                    trip_name        VARCHAR(255) NOT NULL,
                                    start_time       TIMESTAMP NOT NULL,
                                    end_time         TIMESTAMP NOT NULL,
                                    meetup_time      TIMESTAMP,
                                    trip_destination VARCHAR(255) NOT NULL,
                                    meeting_point    VARCHAR(255),
                                    image_url        TEXT,
                                    trip_starus      trip_status default 'Upcoming',
                                    created_by       INTEGER NOT NULL -- add REFERENCES users(id), when user table exist

                                    CONSTRAINT chk_dates CHECK (start_time <= end_time)
);

CREATE TABLE IF NOT EXISTS Account (
                                       user_id          SERIAL PRIMARY KEY,
                                       first_name       VARCHAR(255) NOT NULL,
                                       last_name        VARCHAR(255) NOT NULL,
                                       username         VARCHAR(255) NOT NULL,
                                       email            VARCHAR(255) NOT NULL,
                                       password         TEXT NOT NULL          -- stores bcrypt hash, never plain text
                                       -- awards Should be in another table I think
);

CREATE TABLE IF NOT EXISTS TripMember (
                                          participant_id    SERIAL PRIMARY KEY,
                                          trip_id           INTEGER NOT NULL REFERENCES Trip(trip_id) ON DELETE CASCADE,
                                          user_id           INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
                                          member_status     member_status default 'Undecided'
);

CREATE TABLE IF NOT EXISTS TripInvite (
                                          trip_invite_id    SERIAL PRIMARY KEY,
                                          trip_id           INTEGER NOT NULL REFERENCES Trip(trip_id) ON DELETE CASCADE,
                                          user_id           INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
                                          invite_status     invite_status default 'Undecided'
);
