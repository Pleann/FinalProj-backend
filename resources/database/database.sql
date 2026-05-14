CREATE TYPE trip_status AS ENUM ('Upcoming', 'Ongoing', 'Completed');

CREATE TABLE IF NOT EXISTS trip (
    trip_id          SERIAL PRIMARY KEY,
    trip_name        VARCHAR(255) NOT NULL,
    start_time       TIMESTAMP NOT NULL,
    end_time         TIMESTAMP NOT NULL,
    meetup_time      TIMESTAMP,
    trip_destination VARCHAR(255) NOT NULL,
    meeting_point    VARCHAR(255),
    image_url        TEXT,
    starus           trip_status default 'Upcoming',
    created_by       INTEGER NOT NULL -- add REFERENCES users(id), when user table exist

    CONSTRAINT chk_dates CHECK (start_time <= end_time)
    );