DO $$ BEGIN
CREATE TYPE trip_status AS ENUM ('Upcoming', 'Active', 'Completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE TYPE member_status AS ENUM ('Participating', 'Not_participating', 'Cancelled', 'Undecided');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE TYPE member_attendance AS ENUM ('VeryEarly', 'Early', 'OnTime', 'Late', 'VeryLate', 'Missing', 'Undecided');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE TYPE invite_status AS ENUM ('Accept', 'Reject', 'Cancelled', 'Undecided');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS Account (
                                       user_id          SERIAL PRIMARY KEY,
                                       first_name       VARCHAR(255) NOT NULL,
                                       last_name        VARCHAR(255) NOT NULL,
                                       username         VARCHAR(255) NOT NULL,
                                       email            VARCHAR(255) NOT NULL,
                                       password         TEXT NOT NULL          -- stores bcrypt hash, never plain text
                                    -- awards Should be in another table I think
    );

CREATE TABLE IF NOT EXISTS Trip (
                                    trip_id          SERIAL PRIMARY KEY,
                                    trip_name        VARCHAR(255) NOT NULL,
                                    start_time       TIMESTAMP NOT NULL,
                                    end_time         TIMESTAMP NOT NULL,
                                    meetup_time      TIMESTAMP,
                                    trip_destination VARCHAR(255) NOT NULL,
                                    meeting_point    VARCHAR(255),
                                    image_url        TEXT,
                                    trip_status      trip_status default 'Upcoming',
                                    created_by       INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE SET NULL,

                                    CONSTRAINT chk_dates CHECK (start_time <= end_time)
);

CREATE TABLE IF NOT EXISTS TripMember (
                                          participant_id    SERIAL PRIMARY KEY,
                                          trip_id           INTEGER NOT NULL REFERENCES Trip(trip_id) ON DELETE CASCADE,
                                          user_id           INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
                                          member_status     member_status default 'Undecided',
                                          attendance        member_attendance default 'Undecided',

                                          CONSTRAINT unique_trip_member UNIQUE (trip_id, user_id)
);

CREATE TABLE IF NOT EXISTS TripInvite (
                                          trip_invite_id    SERIAL PRIMARY KEY,
                                          trip_id           INTEGER NOT NULL REFERENCES Trip(trip_id) ON DELETE CASCADE,
                                          user_id           INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
                                          invite_status     invite_status default 'Undecided',

                                          CONSTRAINT unique_trip_invite UNIQUE (trip_id, user_id)
);

CREATE TABLE IF NOT EXISTS Location (
                                          location_id       SERIAL PRIMARY KEY,
                                          trip_id           INTEGER NOT NULL REFERENCES Trip(trip_id) ON DELETE CASCADE,
                                          user_id           INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
                                          latitude          DECIMAL(8,6) NOT NULL,
                                          longitude         DECIMAL(9,6) NOT NULL,
                                          location_timestamp TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Activity (
                                          activity_id       SERIAL PRIMARY KEY,
                                          trip_id           INTEGER NOT NULL REFERENCES Trip(trip_id) ON DELETE CASCADE,
                                          user_id           INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
                                          location_name     VARCHAR(255) NOT NULL,
                                          location_type     VARCHAR(255) NOT NULL,
                                          activity_type     VARCHAR(255) NOT NULL,
                                          ac_start_time     TIMESTAMP NOT NULL,
                                          ac_end_time       TIMESTAMP NOT NULL,

                                          CONSTRAINT chk_activity_times CHECK (ac_end_time > ac_start_time)
);

CREATE TABLE IF NOT EXISTS Expense (
                                          expense_id        SERIAL PRIMARY KEY,
                                          trip_id           INTEGER NOT NULL REFERENCES Trip(trip_id) ON DELETE CASCADE,
                                          user_id           INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
                                          activity_id       INTEGER REFERENCES Activity(activity_id) ON DELETE CASCADE,
                                          expense_name      VARCHAR(255) NOT NULL,
                                          amount            NUMERIC(12,2) NOT NULL,
                                          currency          CHAR(3),
                                          billimage_url     TEXT,
                                          expense_timestamp TIMESTAMP
);
