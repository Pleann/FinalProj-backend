/**
 * Unit tests for tripSummary.service.js
 *
 * Updated to match the CURRENT TripSummaryService implementation.
 *
 * Notes:
 * - savePhoto now accepts metadata:
 *   (tripId, userId, file, capturedAt, locationName, latitude, longitude)
 * - setAwards currently accepts only tripId.
 * - getAwardsByTrip currently throws "Trip ID is required" for a missing tripId.
 * - getStoryData currently requires both tripId and userId.
 * - getStoryData returns an object even when all sub-collections are empty.
 * - evaluateAwards currently does not validate tripId/tripStart or check whether a trip exists.
 */

jest.mock('../tripSummary.dao');
jest.mock('../../trip/trip.dao');
jest.mock('../../../util/uploadImage');

const TripSummaryService = require('../tripSummary.service');
const TripSummaryDao = require('../tripSummary.dao');
const TripDao = require('../../trip/trip.dao');
const uploadImage = require('../../../util/uploadImage');

function wrapError(err, message) {
    throw new Error(`${message}: ${err.message}`);
}

const file = { originalname: 'testphoto.jpg' };
const tripStart = '2026-09-10T07:30:00Z';

const photo = (id, url, overrides = {}) => ({
    photoId: id,
    tripId: 1,
    userId: 1,
    photoUrl: url,
    ...overrides,
});

const appendixA = [{
    userId: 1,
    member: [{ user_id: 1, attendance: 'Early' }],
    activities: [{
        user_id: 1,
        activity_type: 'transit',
        location_name: 'Station',
        location_type: 'station',
        ac_start_time: '2026-09-10T08:00:00Z',
        ac_end_time: '2026-09-10T10:00:00Z',
    }],
    awards: [{ user_id: 1, award_name: 'Early Bird' }],
    stops: [
        { user_id: 1, latitude: 18.796, longitude: 98.955 },
        { user_id: 1, latitude: 18.800, longitude: 98.960 },
    ],
    photos: [{ user_id: 1 }],
}];

const flatSummary = {
    members: [{ user_id: 1, attendance: 'Early' }],
    activities: [{
        user_id: 1,
        activity_type: 'transit',
        location_name: 'Station',
        location_type: 'station',
        ac_start_time: '2026-09-10T08:00:00Z',
        ac_end_time: '2026-09-10T10:00:00Z',
    }],
    awards: [],
    stops: [
        { user_id: 1, latitude: 18.796, longitude: 98.955 },
        { user_id: 1, latitude: 18.800, longitude: 98.960 },
    ],
    photos: [{ user_id: 1 }],
};

describe('TripSummaryService', () => {
    let service;
    let dao;
    let tripDao;

    beforeEach(() => {
        jest.clearAllMocks();
        uploadImage.mockReset();

        service = new TripSummaryService();
        dao = TripSummaryDao.mock.instances[0];
        tripDao = TripDao.mock.instances[0];
    });

    // ------------------------------------------------------------------
    // UTC-27: savePhoto
    // Current signature:
    // savePhoto(tripId, userId, file, capturedAt, locationName, latitude, longitude)
    // ------------------------------------------------------------------

    describe('UTC-27: savePhoto', () => {
        test('UTC27-01 saves a photo successfully with metadata', async () => {
            const saved = photo(1, 'https://example.com/test-1.jpeg', {
                capturedAt: '2026-09-10T08:30:00Z',
                locationName: 'Central Market',
                latitude: 18.7889,
                longitude: 98.9847,
            });

            uploadImage.mockResolvedValue(saved.photoUrl);
            dao.insertPhoto.mockResolvedValue(saved);

            await expect(
                service.savePhoto(
                    1,
                    1,
                    file,
                    '2026-09-10T08:30:00Z',
                    'Central Market',
                    18.7889,
                    98.9847
                )
            ).resolves.toEqual(saved);

            expect(uploadImage).toHaveBeenCalledWith(file, 'trip-photos');

            expect(dao.insertPhoto).toHaveBeenCalledWith(
                1,
                1,
                'https://example.com/test-1.jpeg',
                '2026-09-10T08:30:00Z',
                'Central Market',
                18.7889,
                98.9847
            );
        });

        test('UTC27-02 sends null metadata when optional metadata is omitted', async () => {
            const saved = photo(1, 'https://example.com/test-1.jpeg');

            uploadImage.mockResolvedValue(saved.photoUrl);
            dao.insertPhoto.mockResolvedValue(saved);

            await service.savePhoto(1, 1, file);

            expect(dao.insertPhoto).toHaveBeenCalledWith(
                1,
                1,
                'https://example.com/test-1.jpeg',
                null,
                null,
                null,
                null
            );
        });

        test('UTC27-03 throws when tripId is missing', async () => {
            await expect(
                service.savePhoto(null, 1, file)
            ).rejects.toThrow(
                'Could not save photo: tripId is required'
            );

            expect(uploadImage).not.toHaveBeenCalled();
            expect(dao.insertPhoto).not.toHaveBeenCalled();
        });

        test('UTC27-04 throws when userId is missing', async () => {
            await expect(
                service.savePhoto(1, null, file)
            ).rejects.toThrow(
                'Could not save photo: userId is required'
            );

            expect(uploadImage).not.toHaveBeenCalled();
            expect(dao.insertPhoto).not.toHaveBeenCalled();
        });

        test('UTC27-05 throws when file is missing', async () => {
            await expect(
                service.savePhoto(1, 1, null)
            ).rejects.toThrow(
                'Could not save photo: file is required'
            );

            expect(uploadImage).not.toHaveBeenCalled();
            expect(dao.insertPhoto).not.toHaveBeenCalled();
        });
    });

    // ------------------------------------------------------------------
    // UTC-28: getPhotosByTrip
    // ------------------------------------------------------------------

    describe('UTC-28: getPhotosByTrip', () => {
        test('UTC28-01 retrieves photos for a trip with photos', async () => {
            const photos = [1, 2, 3].map((id) =>
                photo(id, `https://example.com/test-${id}.jpeg`)
            );

            dao.getPhotosByTrip.mockResolvedValue(photos);

            const result = await service.getPhotosByTrip(1);

            expect(result).toEqual(photos);
        });

        test('UTC28-02 returns an empty array when the trip has no photos', async () => {
            dao.getPhotosByTrip.mockResolvedValue([]);

            await expect(
                service.getPhotosByTrip(2)
            ).resolves.toEqual([]);
        });

        test('UTC28-03 throws when tripId is missing', async () => {
            await expect(
                service.getPhotosByTrip(null)
            ).rejects.toThrow(
                'Could not retrieve photos: tripId is required'
            );
        });
    });

    // ------------------------------------------------------------------
    // UTC-29: setAwards
    // Current signature: setAwards(tripId)
    // ------------------------------------------------------------------

    describe('UTC-29: setAwards', () => {
        test('UTC29-01 evaluates and persists awards for the trip', async () => {
            dao.getSummaryByTrip.mockResolvedValue(flatSummary);
            tripDao.findById.mockResolvedValue({
                startTime: tripStart,
            });

            const evaluatedAwards = [
                {
                    tripId: 1,
                    userId: 1,
                    awardName: 'Transit Titan',
                    awardDesc: 'spent the trip going places!',
                },
            ];

            jest.spyOn(service, 'evaluateAwards')
                .mockReturnValue(evaluatedAwards);

            dao.setAward.mockResolvedValue({
                awardId: 1,
                ...evaluatedAwards[0],
            });

            const result = await service.setAwards(1);

            expect(dao.getSummaryByTrip).toHaveBeenCalledWith(1);
            expect(tripDao.findById).toHaveBeenCalledWith(1);

            expect(service.evaluateAwards).toHaveBeenCalledWith(
                1,
                expect.arrayContaining([
                    expect.objectContaining({
                        userId: 1,
                    }),
                ]),
                tripStart
            );

            expect(dao.setAward).toHaveBeenCalledWith(
                1,
                1,
                'Transit Titan',
                'spent the trip going places!'
            );

            expect(result).toEqual([
                expect.objectContaining({
                    awardName: 'Transit Titan',
                }),
            ]);
        });

        test('UTC29-02 returns an empty array when evaluateAwards returns no awards', async () => {
            dao.getSummaryByTrip.mockResolvedValue(flatSummary);
            tripDao.findById.mockResolvedValue({
                startTime: tripStart,
            });

            jest.spyOn(service, 'evaluateAwards')
                .mockReturnValue([]);

            await expect(
                service.setAwards(1)
            ).resolves.toEqual([]);

            expect(dao.setAward).not.toHaveBeenCalled();
        });

        test('UTC29-03 throws when tripId is missing', async () => {
            await expect(
                service.setAwards(null)
            ).rejects.toThrow(
                'Could not set award: tripId is required'
            );

            expect(dao.getSummaryByTrip).not.toHaveBeenCalled();
        });

        test('UTC29-04 propagates summary retrieval errors', async () => {
            dao.getSummaryByTrip.mockRejectedValue(
                new Error('Summary retrieval failed')
            );

            await expect(
                service.setAwards(1)
            ).rejects.toThrow(
                'Summary retrieval failed'
            );
        });

        test('UTC29-05 propagates trip retrieval errors', async () => {
            dao.getSummaryByTrip.mockResolvedValue(flatSummary);

            tripDao.findById.mockRejectedValue(
                new Error('Trip not found')
            );

            await expect(
                service.setAwards(9999)
            ).rejects.toThrow(
                'Trip not found'
            );
        });
    });

    // ------------------------------------------------------------------
    // UTC-30: getAwardsByTrip
    // ------------------------------------------------------------------

    describe('UTC-30: getAwardsByTrip', () => {
        test('UTC30-01 retrieves awards for a trip with awards', async () => {
            const awards = [
                'View Hunter',
                'Foodie Supreme',
                'Late Turtle',
            ].map((awardName) => ({
                tripId: 1,
                awardName,
            }));

            dao.getAwardsByTrip.mockResolvedValue(awards);

            await expect(
                service.getAwardsByTrip(1)
            ).resolves.toEqual(awards);
        });

        test('UTC30-02 returns an empty array for a trip with no awards', async () => {
            dao.getAwardsByTrip.mockResolvedValue([]);

            await expect(
                service.getAwardsByTrip(1)
            ).resolves.toEqual([]);
        });

        test('UTC30-03 throws when tripId is missing', async () => {
            await expect(
                service.getAwardsByTrip(null)
            ).rejects.toThrow(
                'Could not retrieve trip awards: trip ID is required'
            );
        });

        test('UTC30-04 propagates DAO errors without wrapping them', async () => {
            dao.getAwardsByTrip.mockRejectedValue(
                new Error('Trip not found')
            );

            await expect(
                service.getAwardsByTrip(9999)
            ).rejects.toThrow(
                'Trip not found'
            );
        });
    });

    // ------------------------------------------------------------------
    // UTC-31: getSummaryByTrip
    // ------------------------------------------------------------------

    describe('UTC-31: getSummaryByTrip', () => {
        test('UTC31-01 retrieves trip summary data', async () => {
            const summary = {
                activities: [
                    {
                        activity_type: 'sightseeing',
                        location_name: 'Ang Kaew',
                    },
                ],
            };

            dao.getSummaryByTrip.mockResolvedValue(summary);

            await expect(
                service.getSummaryByTrip(1)
            ).resolves.toEqual(summary);
        });

        test('UTC31-02 returns summary with zero activities', async () => {
            dao.getSummaryByTrip.mockResolvedValue({
                activities: [],
            });

            await expect(
                service.getSummaryByTrip(2)
            ).resolves.toEqual({
                activities: [],
            });
        });

        test('UTC31-03 throws when tripId is missing', async () => {
            await expect(
                service.getSummaryByTrip(null)
            ).rejects.toThrow(
                'Could not retrieve trip summary: tripId is required'
            );
        });
    });

    // ------------------------------------------------------------------
    // UTC-32: getActivityGraphDataByUser
    // ------------------------------------------------------------------

    describe('UTC-32: getActivityGraphDataByUser', () => {
        test('UTC32-01 retrieves graph data for trip + user', async () => {
            const counts = [
                {
                    activity_type: 'SightSeeing',
                    count: 12,
                },
            ];

            dao.getActivityTypeCountsByUser
                .mockResolvedValue(counts);

            await expect(
                service.getActivityGraphDataByUser(1, 1)
            ).resolves.toEqual({
                totalActivityTypes: 1,
                activityTypeCounts: counts,
            });
        });

        test('UTC32-02 returns zero activity types for a user with no recorded activities', async () => {
            dao.getActivityTypeCountsByUser
                .mockResolvedValue([]);

            await expect(
                service.getActivityGraphDataByUser(1, 10)
            ).resolves.toEqual({
                totalActivityTypes: 0,
                activityTypeCounts: [],
            });
        });

        test('UTC32-03 throws when tripId is missing', async () => {
            await expect(
                service.getActivityGraphDataByUser(null, 1)
            ).rejects.toThrow(
                'Could not retrieve activity data: tripId is required'
            );
        });

        test('UTC32-04 throws when userId is missing', async () => {
            await expect(
                service.getActivityGraphDataByUser(1, null)
            ).rejects.toThrow(
                'Could not retrieve activity data: userId is required'
            );
        });
    });

    // ------------------------------------------------------------------
    // UTC-33: getStoryData
    // Current signature: getStoryData(tripId, userId)
    // ------------------------------------------------------------------

    describe('UTC-33: getStoryData', () => {
        beforeEach(() => {
            service.setAwards = jest.fn()
                .mockResolvedValue([]);
        });

        test('UTC33-01 retrieves story data for a trip and user', async () => {
            const summary = {
                members: [],
                activities: [
                    {
                        activity_type: 'sightseeing',
                        location_name: 'Ang Kaew',
                    },
                ],
                stops: [],
            };

            const photos = [
                photo(1, 'https://example.com/test-1.jpeg'),
                photo(2, 'https://example.com/test-2.jpeg'),
            ];

            const awards = [
                'View Hunter',
                'Foodie Supreme',
                'Late Turtle',
            ].map((awardName) => ({
                awardName,
            }));

            const activityTypeCounts = [
                {
                    activity_type: 'sightseeing',
                    count: 1,
                },
            ];

            const reliabilityScores = [
                {
                    userId: 1,
                    attendance: 'Early',
                },
            ];

            dao.getSummaryByTrip.mockResolvedValue(summary);
            dao.getPhotosByTrip.mockResolvedValue(photos);
            dao.getAwardsByTrip.mockResolvedValue(awards);
            dao.getActivityTypeCountsByUser
                .mockResolvedValue(activityTypeCounts);
            dao.getTripMemberReliabilityScore
                .mockResolvedValue(reliabilityScores);

            const result =
                await service.getStoryData(1, 1);

            expect(service.setAwards)
                .toHaveBeenCalledWith(1);

            expect(
                dao.getActivityTypeCountsByUser
            ).toHaveBeenCalledWith(1, 1);

            expect(result).toEqual({
                ...summary,
                photos,
                awards,
                activityTypeCounts,
                tripMemberReliabilityScores:
                    reliabilityScores,
            });
        });

        test('UTC33-02 returns an object with empty collections when story data is empty', async () => {
            const summary = {
                members: [],
                activities: [],
                stops: [],
            };

            dao.getSummaryByTrip.mockResolvedValue(summary);
            dao.getPhotosByTrip.mockResolvedValue([]);
            dao.getAwardsByTrip.mockResolvedValue([]);
            dao.getActivityTypeCountsByUser
                .mockResolvedValue([]);
            dao.getTripMemberReliabilityScore
                .mockResolvedValue([]);

            await expect(
                service.getStoryData(2, 1)
            ).resolves.toEqual({
                ...summary,
                photos: [],
                awards: [],
                activityTypeCounts: [],
                tripMemberReliabilityScores: [],
            });
        });

        test('UTC33-03 throws when tripId is missing', async () => {
            await expect(
                service.getStoryData(null, 1)
            ).rejects.toThrow(
                'Could not retrieve story data: tripId is required'
            );
        });

        test('UTC33-04 throws when userId is missing', async () => {
            await expect(
                service.getStoryData(1, null)
            ).rejects.toThrow(
                'Could not retrieve story data: userId is required'
            );
        });

        test('UTC33-05 propagates setAwards errors', async () => {
            service.setAwards.mockRejectedValue(
                new Error('Award generation failed')
            );

            await expect(
                service.getStoryData(1, 1)
            ).rejects.toThrow(
                'Award generation failed'
            );

            expect(dao.getSummaryByTrip)
                .not.toHaveBeenCalled();
        });

        test('UTC33-06 propagates story retrieval errors', async () => {
            dao.getSummaryByTrip.mockRejectedValue(
                new Error('Story retrieval failed')
            );

            dao.getPhotosByTrip.mockResolvedValue([]);
            dao.getAwardsByTrip.mockResolvedValue([]);
            dao.getActivityTypeCountsByUser
                .mockResolvedValue([]);
            dao.getTripMemberReliabilityScore
                .mockResolvedValue([]);

            await expect(
                service.getStoryData(1, 1)
            ).rejects.toThrow(
                'Story retrieval failed'
            );
        });
    });

    // ------------------------------------------------------------------
    // UTC-34: evaluateAwards
    //
    // Important current behavior:
    // - no explicit input validation
    // - no trip existence lookup
    // - tripId is simply copied into returned awards
    // ------------------------------------------------------------------

    describe('UTC-34: evaluateAwards', () => {
        test('UTC34-01 returns generated awards for valid summaries', () => {
            const result =
                service.evaluateAwards(
                    1,
                    appendixA,
                    tripStart
                );

            expect(result).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        tripId: 1,
                        userId: 1,
                        awardName: 'Transit Titan',
                        awardDesc:
                            'spent the trip going places!',
                    }),
                ])
            );
        });

        test('UTC34-02 returns awards with a null tripId because the current method does not validate tripId', () => {
            const result =
                service.evaluateAwards(
                    null,
                    appendixA,
                    tripStart
                );

            expect(result.length).toBeGreaterThan(0);

            expect(
                result.every(
                    (award) => award.tripId === null
                )
            ).toBe(true);
        });

        test('UTC34-03 throws a TypeError when summaries is null', () => {
            expect(() =>
                service.evaluateAwards(
                    1,
                    null,
                    tripStart
                )
            ).toThrow(TypeError);
        });

        test('UTC34-04 accepts a null tripStart because the current method does not validate it', () => {
            const result =
                service.evaluateAwards(
                    1,
                    appendixA,
                    null
                );

            expect(result.length).toBeGreaterThan(0);
            expect(
                result.every(
                    (award) => award.tripId === 1
                )
            ).toBe(true);
        });

        test('UTC34-05 does not check whether tripId exists', () => {
            const result =
                service.evaluateAwards(
                    9999,
                    appendixA,
                    tripStart
                );

            expect(result.length).toBeGreaterThan(0);

            expect(
                result.every(
                    (award) => award.tripId === 9999
                )
            ).toBe(true);
        });
    });

    // ------------------------------------------------------------------
    // UTC-35: deletePhoto
    // ------------------------------------------------------------------

    describe('UTC-35: deletePhoto', () => {
        test('UTC35-01 successfully deletes a photo', async () => {
            const deleted =
                photo(
                    1,
                    'https://example.com/test-1.jpeg'
                );

            dao.deletePhoto.mockResolvedValue(deleted);

            await expect(
                service.deletePhoto(1)
            ).resolves.toEqual(deleted);
        });

        test('UTC35-02 throws when photoId is missing', async () => {
            await expect(
                service.deletePhoto(null)
            ).rejects.toThrow(
                'Could not delete, photoId is required'
            );
        });
    });

    // ------------------------------------------------------------------
    // UTC-36: getActivityGraphDataByTrip
    // ------------------------------------------------------------------

    describe('UTC-36: getActivityGraphDataByTrip', () => {
        test('UTC36-01 retrieves activity graph data for a trip', async () => {
            const counts = [
                {
                    activity_type: 'SightSeeing',
                    count: 12,
                },
            ];

            dao.getActivityTypeCountsByTrip
                .mockResolvedValue(counts);

            await expect(
                service.getActivityGraphDataByTrip(1)
            ).resolves.toEqual({
                totalActivityTypes: 1,
                activityTypeCounts: counts,
            });
        });

        test('UTC36-02 returns zero activity types when the trip has no recorded activities', async () => {
            dao.getActivityTypeCountsByTrip
                .mockResolvedValue([]);

            await expect(
                service.getActivityGraphDataByTrip(1)
            ).resolves.toEqual({
                totalActivityTypes: 0,
                activityTypeCounts: [],
            });
        });

        test('UTC36-03 throws when tripId is missing', async () => {
            await expect(
                service.getActivityGraphDataByTrip(null)
            ).rejects.toThrow(
                'Could not retrieve activity data: tripId is required'
            );
        });
    });
});
