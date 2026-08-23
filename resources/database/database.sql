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

DO $$ BEGIN
CREATE TYPE notification_type AS ENUM ('TripStarted', 'Invite');
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
                                    start_date       TIMESTAMPTZ NOT NULL,
                                    end_date         TIMESTAMPTZ NOT NULL,
                                    start_time       TIMESTAMPTZ NOT NULL,
                                    trip_destination VARCHAR(255) NOT NULL,
                                    meeting_point_name VARCHAR(255),
                                    meeting_point_lat  NUMERIC(8,6),
                                    meeting_point_lon  NUMERIC(9,6),
                                    image_url        TEXT,
                                    trip_status      trip_status default 'Upcoming',
                                    created_by       INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE SET NULL,

                                    CONSTRAINT chk_dates CHECK (start_date <= end_date)
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
                                          location_timestamp TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS Activity (
                                          activity_id       SERIAL PRIMARY KEY,
                                          trip_id           INTEGER NOT NULL REFERENCES Trip(trip_id) ON DELETE CASCADE,
                                          user_id           INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
                                          location_name     VARCHAR(255),
                                          location_type     VARCHAR(255),
                                          activity_type     VARCHAR(255),
                                          ac_start_time     TIMESTAMPTZ NOT NULL,
                                          ac_end_time       TIMESTAMPTZ NOT NULL,

                                          CONSTRAINT chk_activity_times CHECK (ac_end_time > ac_start_time)
);

CREATE TABLE IF NOT EXISTS Expense (
                                          expense_id        SERIAL PRIMARY KEY,
                                          trip_id           INTEGER NOT NULL REFERENCES Trip(trip_id) ON DELETE CASCADE,
                                          user_id           INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
                                          activity_id       INTEGER REFERENCES Activity(activity_id) ON DELETE CASCADE,
                                          expense_name      VARCHAR(255) NOT NULL,
                                          amount            NUMERIC(12,2) NOT NULL,
                                          currency          VARCHAR(5),
                                          billimage_url     TEXT,
                                          expense_timestamp TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS Stop (
                                    stop_id     SERIAL PRIMARY KEY,
                                    trip_id     INTEGER NOT NULL REFERENCES Trip(trip_id) ON DELETE CASCADE,
                                    user_id     INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
                                    activity_id INTEGER REFERENCES Activity(activity_id) ON DELETE SET NULL,
                                    latitude    DECIMAL(8,6) NOT NULL,
                                    longitude   DECIMAL(9,6) NOT NULL,
                                    entered_at  TIMESTAMPTZ NOT NULL,
                                    exited_at   TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS Notification (
                                    notification_id   SERIAL PRIMARY KEY,
                                    user_id            INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
                                    trip_id            INTEGER NOT NULL REFERENCES Trip(trip_id) ON DELETE CASCADE,
                                    title              TEXT NOT NULL,
                                    message            TEXT NOT NULL,
                                    reference_id       INTEGER,
                                    is_read            BOOLEAN DEFAULT FALSE,
                                    created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS TripPhoto (
                                    photo_id           SERIAL PRIMARY KEY,
                                    trip_id            INTEGER NOT NULL REFERENCES Trip(trip_id) ON DELETE CASCADE,
                                    user_id            INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
                                    photo_url          TEXT NOT NULL,
                                    uploaded_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Award (
                                    award_id           SERIAL PRIMARY KEY,
                                    trip_id            INTEGER NOT NULL REFERENCES Trip(trip_id) ON DELETE CASCADE,
                                    user_id            INTEGER NOT NULL REFERENCES Account(user_id) ON DELETE CASCADE,
                                    award_name         VARCHAR(255) NOT NULL,
                                    award_description  TEXT,
                                    awarded_at         TIMESTAMPTZ DEFAULT NOW()
);
