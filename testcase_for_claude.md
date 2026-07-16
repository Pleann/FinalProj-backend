# Unit Test Cases

## Feature #3: Trip Management

### Test ID: UTC-01
**Module:** `trip.service.js`
**Method Under Test:** `async createTrip(createTripDto, ownerId, file)`
**Description:** Verifies validity of data while calling repository and data access object to add the data to database.
**Prepared data:** Valid createTripDto, invalid createTripDto, valid profile photo, invalid profile photo.

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-01-01 | Create a trip successfully without a file | createTripDto = (Appendix A), ownerId = 1, File = null | Returns the saved trip object |
| UTC-01-02 | Create a trip successfully with a file | createTripDto = (Appendix A), ownerId = 1, File = profile_photo_test.png | Returns the saved trip object. With imageUrl set |
| UTC-01-03 | Throw an error when createTripDto is missing | createTripDto = (Appendix A), ownerId = 1, File = profile_photo_test.png | Throws Error "Could not create trip" |
| UTC-01-04 | Throw an error when uploadImage fails | createTripDto = (Appendix A), ownerId = 1, File = profile_photo_test.png | Throws Error "Image upload failed: ${error.message}" |

---

### Test ID: UTC-02
**Module:** `trip.service.js`
**Method Under Test:** `async getUpcomingTrips()`
**Description:** Verifies that the repository is called and returns only trips that are scheduled in the future.
**Prepared data:** -

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-02-01 | Returns upcoming trip successfully | - | Returns an array of trip objects |
| UTC-02-02 | Fails to fetch upcoming trips | - | Throws Error "Could not find all trips" |

---

### Test ID: UTC-03
**Module:** `trip.service.js`
**Method Under Test:** `async getActiveTrips()`
**Description:** Verifies that the repository is called and returns only trips that are currently ongoing.
**Prepared data:** -

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-03-01 | Returns active trip successfully | - | Returns an array of trip objects |
| UTC-03-02 | Fails to fetch active trips | - | Throws Error "Could not find all trips" |

---

### Test ID: UTC-04
**Module:** `trip.service.js`
**Method Under Test:** `async getCompletedTrips()`
**Description:** Verifies that the repository is called and returns only trips that have already been completed.
**Prepared data:** -

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-04-01 | Returns completed trip successfully | - | Returns an array of trip objects |
| UTC-04-02 | Fails to fetch completed trips | - | Throws Error "Could not find all trips" |

---

### Test ID: UTC-05
**Module:** `trip.service.js`
**Method Under Test:** `async updateTrip(tripId, body, file)`
**Description:** Verifies validity of the provided data and file while calling the repository to update an existing trip record in the database.
**Prepared data:** Valid createTripDto, invalid createTripDto, valid profile photo, invalid profile photo.

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-05-01 | Update a trip successfully without a file | createTripDto = (Appendix B), ownerId = 1, File = null | Returns the saved trip object |
| UTC-05-02 | Update a trip successfully with a file | createTripDto = (Appendix B), ownerId = 1, File = profile_photo_test.png | Returns the saved trip object. With imageUrl set |
| UTC-05-03 | Throw an error when no fields are provided to update | createTripDto = (Appendix A), ownerId = 1, File = profile_photo_test.png | Throws Error "No fields provided to update" |
| UTC-05-04 | Throw an error when start_time is after end_time | createTripDto = (Appendix C), ownerId = 1, File = profile_photo_test.png | Throws Error "Start date must be before end date" |
| UTC-05-05 | Throw an error when uploadImage fails | createTripDto = (Appendix B), ownerId = 1, File = profile_photo_test.png | Throws Error "Image upload failed: ${error.message}" |

---

### Test ID: UTC-06
**Module:** `trip.service.js`
**Method Under Test:** `async updateTripStatus(tripId, status)`
**Description:** Verifies that the provided trip ID and status are valid while calling the repository to update the status of an existing trip in the database.
**Prepared data:** Valid trip, trip status

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-06-01 | Update trip status successfully with "Upcoming" status | TripId = 1, Status = Upcoming | Returns the updated trip object with new status |
| UTC-06-02 | Update trip status successfully with "Active" status | TripId = 1, Status = Active | Returns the updated trip object with new status |
| UTC-06-03 | Update trip status successfully with "Completed" status | TripId = 1, Status = Completed | Returns the updated trip object with new status |
| UTC-06-04 | Throw an error when status is invalid | TripId = 1, Status = null | Returns the updated trip object with new status |

---

### Test ID: UTC-07
**Module:** `trip.service.js`
**Method Under Test:** `async deleteTrip(tripId)`
**Description:** Verifies that the provided trip ID exists while calling the repository to remove the corresponding trip record from the database.
**Prerequisite data:** Valid trip, invalid trip

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-07-01 | Delete a trip successfully with a valid tripId | tripId = 1 | Return delete object |
| UTC-07-02 | Delete a trip successfully with an invalid tripId | tripId = null | Throw Error "Could not find trip ID" |

---

### Test ID: UTC-08
**Module:** `tripInvite.service.js`
**Method Under Test:** `async sendInvite(tripId, createTripInviteDto, ownerId)`
**Description:** Verifies validity of the invite data and trip ID while calling the repository to send an invitation to a user for a specific trip in the database.
**Prepared data:** valid trip, invalid trip, valid user, invalid user

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-08-01 | Send an invite successfully | tripId = 1, createTripInviteDto = {userId = 2}, ownerId = 1 | Returns the saved invite object |
| UTC-08-02 | Throw an error when trip is not found | tripId = 0, createTripInviteDto = {userId = 2}, ownerId = 1 | Throws Error "Trip not found" |
| UTC-08-03 | Throw an error when requester is not the trip owner | tripId = 1, createTripInviteDto = {userId = 2}, ownerId = 3 | Throws Error "Only the trip owner can send invites" |
| UTC-08-04 | Throw an error when trip status is not Upcoming | tripId = 1, createTripInviteDto = {userId = 2}, ownerId = 1 | Throws Error "Only the trip owner can send invites" |

---

### Test ID: UTC-09
**Module:** `tripInvite.service.js`
**Method Under Test:** `async getInvitesByTrip(tripId)`
**Description:** Verifies that the trip ID is valid while calling the repository to retrieve all invites associated with a specific trip from the database.
**Prepared data:** valid trip, invalid trip

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-09-01 | Return all invites for a trip successfully | tripId = 1 | Returns an array of invite objects |
| UTC-09-02 | Throw an error when tripId is missing | tripId = null | Throw Error "Could not fetch invite by tripId" |

---

### Test ID: UTC-10
**Module:** `tripInvite.service.js`
**Method Under Test:** `async respondToInvite(tripInviteId, updateTripInviteDto)`
**Description:** Verifies validity of the invite ID and response data while calling the repository to update the invite response status in the database.
**Prepared data:** tripInviteId, updateTripInviteDto

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-10-01 | Respond to an invite successfully with "Accept" | tripInviteId = 1, updateTripInviteDto = { inviteStatus: "Accept" } | Returns updated inviteStatus and inserts user into TripMember |
| UTC-10-02 | Respond to an invite successfully with "Rejected" | tripInviteId = 1, updateTripInviteDto = { inviteStatus: "Rejected" } | Returns updated inviteStatus |
| UTC-10-03 | Respond to an invite successfully with "Cancelled" | tripInviteId = 1, updateTripInviteDto = { inviteStatus: "Cancelled" } | Returns updated inviteStatus |

---

### Test ID: UTC-11
**Module:** `tripMember.service.js`
**Method Under Test:** `async getMembersByTrip(tripId)`
**Description:** Verifies that the trip ID is valid while calling the repository to retrieve all members associated with a specific trip from the database.
**Prepared data:** valid trip, invalid trip

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-11-01 | Return all members for a trip successfully | tripId = 1 | Returns an array of member objects |
| UTC-11-02 | Throw an error when tripId is missing | tripId = null | Throws Error "Could not fetch member by tripId" |

---

### Test ID: UTC-12
**Module:** `tripMember.service.js`
**Method Under Test:** `async updateMemberStatus(tripId, participantId, updateTripMemberDto, ownerId)`
**Description:** Verifies that the trip ID, participant ID, and owner ID are valid while calling the repository to update the status of a specific member within a trip in the database.
**Prepared data:** tripId, participantId, updateTripMemberDto

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-12-01 | Update member status successfully | tripId = 1, participantId = 1, updateTripMemberDto = { memberStatus: "Participating" }, ownerId = 1 | Returns the updated member object |
| UTC-12-02 | Throw an error when trip is not found | tripId = 0, participantId = 1, updateTripMemberDto = { memberStatus: "Participating" }, ownerId = 1 | Throws Error "Trip not found" |
| UTC-12-03 | Throw an error when requester is not the trip owner | tripId = 1, participantId = 1, updateTripMemberDto = { memberStatus: "Participating" }, ownerId = 3 | Throws Error "Only the trip owner can edit members" |
| UTC-12-04 | Throw an error when trip status is not Upcoming | tripId = 1, participantId = 1, updateTripMemberDto = { memberStatus: "Participating" }, ownerId = 1 | Throws Error "Can only edit members of Upcoming trips" |

---

### Test ID: UTC-13
**Module:** `tripMember.service.js`
**Method Under Test:** `async removeMember(tripId, participantId, ownerId)`
**Description:** Verifies that the trip ID, participant ID, and owner ID are valid while calling the repository to remove a specific member from a trip in the database.
**Prepared data:** tripId, participantId, ownerId

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-13-01 | Remove a member successfully | tripId = 1, participantId = 1, ownerId = 1 | Returns the deleted member object |
| UTC-13-02 | Throw an error when trip is not found | tripId = 1, participantId = 1, ownerId = 1 | Throws Error "Trip not found" |
| UTC-13-03 | Throw an error when requester is not the trip owner | tripId = 1, participantId = 1, ownerId = 1 | Throws Error "Only the trip owner can remove members" |
| UTC-13-04 | Throw an error when trip status is not Upcoming | tripId = 1, participantId = 1, ownerId = 1 | Throws Error "Can only remove members from Upcoming trips" |

---

## Feature #4: Trip Tracking, Activity & Expense Detection

### Test ID: UTC-14
**Module:** `tripLocation.service.js`
**Method Under Test:** `async confirmStart(tripId)`
**Description:** Verifies that the trip exists and is not already active while calling the repository to activate the trip and update its status to Active in the database.
**Prepared data:** valid tripId, invalid tripId

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-14-01 | Confirm trip start successfully | tripId = 1 | Returns the activated trip object |
| UTC-14-02 | Throw an error when trip is not found | tripId = null | Throws Error "Trip not found" |

---

### Test ID: UTC-15
**Module:** `tripLocation.service.js`
**Method Under Test:** `async findAndStartDueTrips()`
**Description:** Verifies that trips which are due to start are fetched from the repository, and that each due trip is transitioned via confirmStart, with individual failures logged but not stopping processing of the remaining trips.
**Prepared data:** tripStartTime

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-15-01 | Start trips successfully when confirmStart succeeds for trip | tripStartTime = 2026-05-18T08:30:00, with phone's date set to the incorrect time | confirmStart() is called |
| UTC-15-02 | Return early / do nothing when there are no due trips | tripStartTime = 2026-05-18T08:30:00, with phone's date set to the incorrect time | confirmStart() is not called |

---

### Test ID: UTC-16
**Module:** `tripLocation.service.js`
**Method Under Test:** `async saveLocation(tripId, saveLocationDto)`
**Description:** Verifies that the trip exists and is currently active while calling the repository to save a member's current location data for a specific trip in the database.
**Prepared data:** tripId, saveLocationDto

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-16-01 | Save location successfully for an active trip | tripId = 1, saveLocationDto = (Appendix D) | Returns the saved location object |
| UTC-16-02 | Throw an error when trip is not found | tripId = null, saveLocationDto = (Appendix D) | Throws Error "Trip not found" |
| UTC-16-03 | Throw an error when trip is not active | tripId = 3, saveLocationDto = (Appendix D) | Throws Error "Trip is not active" |

---

### Test ID: UTC-17
**Module:** `tripLocation.service.js`
**Method Under Test:** `async getLatestLocations(tripId)`
**Description:** Verifies that the trip exists and is currently active while calling the repository to retrieve the most recent location of each member for a specific trip from the database.
**Prepared data:** valid tripId, invalid tripId

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-17-01 | Return latest locations of all members successfully | tripId = 1 | Returns an array of latest location objects per member |
| UTC-17-02 | Throw an error when trip is not found | tripId = null | Throws Error "Trip not found" |
| UTC-17-03 | Throw an error when trip is not active | tripId = 3 | Throws Error "Trip is not active" |

---

### Test ID: UTC-18
**Module:** `tripLocation.service.js`
**Method Under Test:** `async evaluateAttendance(tripId)`
**Description:** Verifies that the trip exists while calling the repository to evaluate each member's attendance by calculating their proximity to the meeting point or other members using location data, then updates and returns the attendance result for each member in the database.
**Prepared data:** valid tripId, invalid tripId

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-18-01 | Evaluate attendance successfully with a meeting point | tripId = 1 | Returns an array of attendance results with status based on proximity to meeting point |
| UTC-18-02 | Evaluate attendance successfully without a meeting point | tripId = 1 | Returns an array of attendance results with status based on proximity to other members |
| UTC-18-03 | Mark member as "Missing" when no location data is found | tripId = 1 | Returns attendance result with status "Missing" for that member |
| UTC-18-04 | Mark member as "On Time" when arriving before or at start time | tripId = 1 | Returns attendance result with status "On Time" for that member |
| UTC-18-05 | Mark member as "Late" when arriving after start time | tripId = 1 | Returns attendance result with status "Late" for that member |
| UTC-18-06 | Throw an error when trip is not found | tripId = null | Throws Error "Trip not found" |

---

### Test ID: UTC-19
**Module:** `tripLocation.service.js`
**Method Under Test:** `async checkDueAttendance(beforeTime)`
**Description:** Verifies that trips falling within the attendance-check window are fetched from the repository, and that attendance is evaluated for each due trip, with individual failures logged but not stopping evaluation of the remaining trips.
**Prepared data:** beforeTime

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-19-01 | Evaluate attendance for all due trips successfully | beforeTime = 2026-05-18T08:30:00, with phone's date set to the correct time | evaluateAttendance() is called |
| UTC-19-02 | Return early / do nothing when there are no trips due for attendance check | beforeTime = 2026-05-18T08:30:00, with phone's date set to the incorrect time | evaluateAttendance() is not called |

---

### Test ID: UTC-20
**Module:** `tripActivity.service.js`
**Method Under Test:** `async confirmStop(tripId, confirmStopDto)`
**Description:** Verifies whether a user has remained within a defined radius for a minimum duration while calling the repository to track, confirm, or discard a potential stop for a specific trip, then triggers activity creation upon confirmation.
**Prepared data:** tripId, confirmStopDto

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-20-01 | Confirm a stop successfully when user remains within radius for minimum duration | tripId = 1, confirmStopDto = { userId = 1, latitude = 18.7445, longitude = 98.9280, timestamp = 2026-06-16T10:00:00 } | Returns the confirmed stop object |
| UTC-20-02 | Return null when user is still within radius but minimum time has not elapsed | tripId = 1, confirmStopDto = { userId = 1, latitude = 18.7445, longitude = 98.9280, timestamp = 2026-06-16T10:00:00 } | Returns null |
| UTC-20-03 | Discard pending stop and return null when user leaves radius before minimum time | tripId = 1, confirmStopDto = { userId = 1, latitude = 18.7445, longitude = 98.9280, timestamp = 2026-06-16T10:00:00 } | Returns null and deletes pending stop |
| UTC-20-04 | Start tracking a new potential stop when no pending stop exists | tripId = 1, confirmStopDto = { userId = 1, latitude = 18.7445, longitude = 98.9280, timestamp = 2026-06-16T10:00:00 } | Returns null and saves new pending stop |

---

### Test ID: UTC-21
**Module:** `tripActivity.service.js`
**Method Under Test:** `async createActivityFromStop(stop)`
**Description:** Calls the Google Places API using the stop's coordinates to retrieve place details, then calls the repository to save the activity and link it to the corresponding stop in the database.
**Prepared data:** stop

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-21-01 | Create an activity from a stop successfully | stop = (Appendix E) | Returns the created activity object |
| UTC-21-02 | Throw an error when Google Places API call fails | stop = (Appendix E), missing googlePlacesApi key | Throws Error "Failed to fetch place data for stop {stopId}: Network timeout" |
| UTC-21-03 | Throw an error when linking stop to activity fails | stop = (Appendix E), activityId = 1 | Throws Error "Failed to link stop {stopId} to activity 10: Stop already linked" |

---

### Test ID: UTC-22
**Module:** `tripActivity.service.js`
**Method Under Test:** `async getTimeline(tripId)`
**Description:** Calls the repository to retrieve all activities associated with a specific trip and returns them as a timeline from the database.
**Prepared data:** tripId

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-22-01 | Return all activities for a trip successfully | tripId = 1 | Returns an array of activity objects |
| UTC-22-02 | Return an empty array when no activities are found | tripId = 4 | Returns {} |

---

### Test ID: UTC-23
**Module:** `tripActivity.service.js`
**Method Under Test:** `async callGooglePlacesAPI(latitude, longitude)`
**Description:** Sends a request to the Google Places API with the given coordinates and returns the location name, location type, and place types of the nearest place, throwing an error if the API call fails or no place is found.
**Prepared data:** latitude, longitude

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-23-01 | Return place details successfully for valid coordinates | latitude = 18.7445, longitude = 98.9280 | Returns { locationName, locationType, types } |
| UTC-23-02 | Throw an error when API response is not ok | latitude = 18.7445, longitude = 98.9280 | Throws Error "Google Places API error: ${response.statusText}" |
| UTC-23-03 | Throw an error when no place is found at the location | latitude = 18.7445, longitude = 98.9280 | Throws Error "No place found at this location" |
| UTC-23-04 | Return "Unknown" for locationName when displayName is missing | latitude = 18.7445, longitude = 98.9280 | Returns { locationName: "Unknown", locationType, types } |
| UTC-23-05 | Return "Unknown" for locationType when types array is empty | latitude = 18.7445, longitude = 98.9280 | Returns { locationName, locationType: "Unknown", types: {} } |

---

### Test ID: UTC-24
**Module:** `tripNotification.service.js`
**Method Under Test:** `async getNotifications(userId)`
**Description:** Verifies that notifications for a given user are correctly retrieved from the repository, and that any repository failure is caught and re-thrown as a descriptive error referencing the user ID.
**Prepared data:** valid userId, invalid userId

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-24-01 | Retrieve notifications successfully for a valid user | userId = 1 | Returns the list of notification objects as returned by the repository |
| UTC-24-02 | Throw an error when userId is invalid/not found | userId = null | Throws Error "Failed to fetch notifications for user null: Invalid user" |

---

### Test ID: UTC-25
**Module:** `tripNotification.service.js`
**Method Under Test:** `async deleteNotification(notificationId)`
**Description:** Verifies that a notification is correctly deleted via the repository using its ID, and that any repository failure is caught and re-thrown as a descriptive error referencing the notification ID.
**Prepared data:** notificationId

| Test ID | Description | Input | Expected Output |
|---|---|---|---|
| UTC-25-01 | Delete notification successfully | notificationId = 1 | Returns the result from dao.delete |
| UTC-25-02 | Throw a wrapped error when notificationId is null/invalid | notificationId = null | Throws Error "Failed to delete notification null: Invalid notification ID" |

---

## Appendix

### Appendix A — CreateTripDto
```json
{
  "trip_name": "Park trip",
  "start_date": "2026-01-18",
  "end_date": "2026-01-19",
  "start_time": "2026-06-18T08:30:00",
  "trip_destination": "Royal Park Rajapruk",
  "meeting_point": "Royal Park Rajapruk"
}
```

### Appendix B — CreateTripDto
```json
{
  "trip_name": "Beach trip",
  "start_date": "2026-01-18",
  "end_date": "2026-01-19",
  "start_time": "2026-06-18T08:30:00",
  "trip_destination": "Royal Park Chiang Rai",
  "meeting_point": "Royal Park Chiang Rai"
}
```

### Appendix C — CreateTripDto (invalid date range)
```json
{
  "trip_name": "Beach trip",
  "start_date": "2026-01-21",
  "end_date": "2026-01-19",
  "start_time": "2026-06-18T08:30:00",
  "trip_destination": "Royal Park Chiang Rai",
  "meeting_point": "Royal Park Chiang Rai"
}
```

### Appendix D — SaveLocationDto
```json
{
  "user_id": "1",
  "latitude": "18.7445",
  "longitude": "98.9280",
  "location_timestamp": "2026-06-16T10:00:00"
}
```

### Appendix E — Stop
```json
{
  "stopId": "1",
  "tripId": "1",
  "userId": "1",
  "latitude": "18.7445",
  "longitude": "98.9280",
  "enteredAt": "2026-06-16T10:00:00",
  "exitedAt": "2026-06-16T10:30:00"
}
```

### Appendix F — Stop
```json
{
  "stopId": "1",
  "tripId": "1",
  "userId": "1",
  "latitude": "18.7445",
  "longitude": "98.9280",
  "enteredAt": "2026-06-16T10:00:00",
  "exitedAt": "2026-06-16T10:30:00"
}
```
