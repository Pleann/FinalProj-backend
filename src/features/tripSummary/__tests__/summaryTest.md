# Trip Summary Service — Unit Test Cases

Module: `tripSummary.service.js`

This document describes the unit test cases (UTC) prepared for the `tripSummary.service.js` module, covering photo saving/retrieval, award assignment, trip summaries, activity graph data, and story data generation.

---

## UTC-27: `savePhotos(tripId, userId, file)`

**Description:** Handles the saving of a photo's URL selected from the user's chosen album to the specified trip and calls the DAO to record the photo records.

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-27-01 | Save a photo's URL successfully | `tripId = 1`, `userId = 1`, `file = testphoto.jpg` | Returns the saved photo record with `tripId` and `imageUrl` set |
| UTC-27-02 | Throw an error when tripId is missing | `tripId = null`, `userId = 1`, `file = testphoto.jpg` | Throws Error `"Could not save photo: tripId is required"` |
| UTC-27-03 | Throw an error when photo URL is missing or empty | `tripId = 1`, `userId = 1`, `file = null` | Throws Error `"Could not save photo: file is required"` |
| UTC-27-04 | Throw an error when userId is missing | `tripId = 1`, `userId = null`, `file = testphoto.jpg` | Throws Error `"Could not save photo: userId is required"` |
| UTC-27-05 | Throw an error when tripId does not exist | `tripId = 9999`, `userId = 1`, `file = testphoto.jpg` | Throws Error `"Trip not found"` |
| UTC-27-06 | Throw an error when userId does not exist | `tripId = 1`, `userId = 9999`, `file = testphoto.jpg` | Throws Error `"User not found"` |

---

## UTC-28: `getPhotosByTrip(tripId)`

**Description:** Handles the retrieval of all photos associated with a specific trip by calling the DAO to fetch stored photo records.

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-28-01 | Retrieve photos successfully for a trip with photos | `tripId = 1` | Returns `{ photoUrl = [test-1.jpeg, test-2.jpeg, test-3.jpeg] }` (Supabase storage URLs) |
| UTC-28-02 | Retrieve photos for a trip with no photos | `tripId = 2` | Returns `{ photoUrl = [] }` |
| UTC-28-03 | Throw an error when tripId is missing | `tripId = null` | Throws Error `"Could not retrieve photos: tripId is required"` |
| UTC-28-04 | Throw an error when tripId does not exist | `tripId = 9999` | Throws Error `"Trip not found"` |
| UTC-28-05 | Throw an error when the retrieval fails | `tripId = 1` | Throws Error `"Could not retrieve photos: ${error.message}"` |

---

## UTC-29: `setAwards(tripId, userId)`

**Description:** Handles the creation of a trip award record based on data from location, stop, and activity tables, and calls the DAO to record the creation.

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-29-01 | Set an award successfully based on qualifying trip stats | `tripId = 1`, `userId = 1` | Returns the saved award object with `{ tripId = 1, userId = 1, awardName = "Explorer" }` |
| UTC-29-02 | Do not set an award when stats do not meet any award threshold | `tripId = 1`, `userId = 1` (stats: distance = 128km, duration = 4 days, places = 3, activities = 2, qualifies for "Explorer" award) | Returns `{ award = [] }`, message: "user already has an award to this trip" |
| UTC-29-03 | Do not set an award when user already has one | `tripId = 1`, `userId = 3` | Returns `{ award = [] }` |
| UTC-29-04 | Throw an error when tripId is missing | `tripId = null`, `userId = 1` | Throws Error `"Could not set award: tripId is required"` |
| UTC-29-05 | Throw an error when userId is missing | `tripId = 1`, `userId = null` | Throws Error `"Could not set award: userId is required"` |
| UTC-29-06 | Throw an error when tripId does not exist | `tripId = 9999`, `userId = 1` | Throws Error `"Trip not found"` |
| UTC-29-07 | Throw an error when the summary retrieval fails | `tripId = 1`, `userId = 1` | Throws Error `"Could not retrieve trip statistics: ${error.message}"` |

---

## UTC-30: `getAwardsByTrip(tripId)`

**Description:** Handles the retrieval of all awards associated with a specific trip by calling the DAO to fetch stored award records.

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-30-01 | Retrieve awards successfully for a trip with awards | `tripId = 1` | Returns `{ awards = ["View hunter", "foodie supreme", "Late turtle"] }` |
| UTC-30-02 | Retrieve awards for a trip with no awards | `tripId = 1` | Returns `{ awards = [] }` |
| UTC-30-03 | Throw an error when tripId is missing | `tripId = null` | Throws Error `"Could not retrieve awards: tripId is required"` |
| UTC-30-04 | Throw an error when tripId does not exist | `tripId = 9999` | Throws Error `"Trip not found"` |
| UTC-30-05 | Throw an error when the retrieval fails | `tripId = 1` | Throws Error `"Could not retrieve awards: ${error.message}"` |

---

## UTC-31: `getSummaryByTrip(tripId)`

**Description:** Handles the assembly of a completed trip's summary and calls the DAO to retrieve travel statistics, stops, activities, and location data for a certain trip.

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-31-01 | Retrieve trip summary successfully for a completed trip | `tripId = 1` | Returns `{ activities_type = ["sight seeing"], location = ["Ang Kaew"] }` |
| UTC-31-02 | Retrieve summary for a trip with zero recorded activity | `tripId = 2` | Returns `{ activities_type = [], location = [] }` |
| UTC-31-03 | Throw an error when tripId is missing | `tripId = null` | Throws Error `"Could not retrieve trip summary: tripId is required"` |
| UTC-31-04 | Throw an error when tripId does not exist | `tripId = 9999` | Throws Error `"Trip not found"` |
| UTC-31-05 | Throw an error when the retrieval fails | `tripId = 1` | Throws Error `"Could not retrieve trip summary: ${error.message}"` |

---

## UTC-32: `getActivityGraphData(tripId, userId)`

**Description:** Handles the retrieval of `location_name`, `location_type`, and `activity_type` data for the creation of a graph from the activity table in the database.

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-32-01 | Retrieve activity graph data successfully for a trip and user | `tripId = 1`, `userId = 1` | Returns `{ activities_type = ["sight seeing"], location = ["Ang Kaew"] }` |
| UTC-32-02 | Retrieve activity graph data for a user with no recorded activities | `tripId = 1`, `userId = 10` | Returns an empty array |
| UTC-32-03 | Throw an error when tripId is missing | `tripId = null`, `userId = 1` | Throws Error `"Could not retrieve activity data: tripId is required"` |
| UTC-32-04 | Throw an error when userId is missing | `tripId = 1`, `userId = null` | Throws Error `"Could not retrieve activity data: userId is required"` |
| UTC-32-05 | Throw an error when tripId does not exist | `tripId = 9999`, `userId = 1` | Throws Error `"Trip not found"` |
| UTC-32-06 | Throw an error when userId does not exist | `tripId = 1`, `userId = 9999` | Throws Error `"User not found"` |
| UTC-32-07 | Throw an error when the retrieval fails | `tripId = 1`, `userId = 1` | Throws Error `"Could not retrieve activity data: ${error.message}"` |

---

## UTC-33: `getStoryData(tripId)`

**Description:** Handles the retrieval of activities, location, stops, photo URLs, awards, and reliability score data from the database, used for the story function.

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-33-01 | Retrieve story data successfully for a trip | `tripId = 1` | Returns `{ activities_type = ["sight seeing"], location = ["Ang Kaew"], photosUrl = [test-1.jpeg, test-2.jpeg], awards = ["View hunter", "foodie supreme", "Late turtle"] }` |
| UTC-33-02 | Retrieve story data for a user with no recorded activities | `tripId = 2` | Returns an empty array |
| UTC-33-03 | Throw an error when tripId is missing | `tripId = null` | Throws Error `"Could not story data: tripId is required"` |
| UTC-33-04 | Throw an error when tripId does not exist | `tripId = 9999` | Throws Error `"Trip not found"` |
| UTC-33-05 | Throw an error when the retrieval fails | `tripId = 1` | Throws Error `"Could not retrieve story data: ${error.message}"` |