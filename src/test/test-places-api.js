// test-places-api.js
// Standalone script to test callGooglePlacesAPI against the REAL Google Places API.
// Run with: node test-places-api.js
// Requires GOOGLE_PLACES_API_KEY to be set in your .env file.

require('dotenv').config();
const TripActivityService = require('../features/tripActivity/tripActivity.service.js');

const service = new TripActivityService();

// A few known real-world coordinates to test against.
// Pick ones you know have a well-known place nearby, so you can
// sanity-check the returned locationName against what you'd expect.
const testCases = [
    { label: 'Blue Bottle Coffee (SF)', latitude: 37.7764,   longitude: -122.4241 },
    { label: 'Grand Palace (Bangkok)',  latitude: 13.750000, longitude: 100.491667 },
    { label: 'Middle of the ocean (should find nothing)', latitude: 0.0, longitude: -140.0 },
];

async function run() {
    for (const testCase of testCases) {
        console.log(`\n--- Testing: ${testCase.label} ---`);
        console.log(`Coordinates: ${testCase.latitude}, ${testCase.longitude}`);
        try {
            const result = await service.callGooglePlacesAPI(testCase.latitude, testCase.longitude);
            console.log('✅ Success:', result);
        } catch (err) {
            console.log('❌ Error (may be expected, e.g. no place nearby):', err.message);
        }
    }
}

run();