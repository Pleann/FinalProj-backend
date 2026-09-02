
jest.mock('../tripSummary.dao');
jest.mock('../../../util/uploadImage');

const TripSummaryService = require('../tripSummary.service');
const TripSummaryDao = require('../tripSummary.dao');
const uploadImage = require('../../../util/uploadImage');

describe('TripSummaryService', () => {
    let tripSummaryService;
    let daoMock;

    beforeEach(() => {
        jest.clearAllMocks();
        tripSummaryService = new TripSummaryService();
        daoMock = TripSummaryDao.mock.instances[0];
        uploadImage.mockReset();
    });

    describe('UTC-27: savePhotos', () => {
        test('UTC-27-01: saves a photo URL successfully', async () => {
            const file = { originalname: 'testphoto.jpg' };
            const savedPhoto = { tripId: 1, userId: 1, imageUrl: 'https://example.com/testphoto.jpg' };
            uploadImage.mockResolvedValue('https://example.com/testphoto.jpg');
            daoMock.insertPhoto.mockResolvedValue(savedPhoto);

            const result = await tripSummaryService.savePhoto(1, 1, file);

            expect(uploadImage).toHaveBeenCalledWith(file, 'trip-photos');
            expect(daoMock.insertPhoto).toHaveBeenCalledWith(1, 1, 'https://example.com/testphoto.jpg');
            expect(result).toEqual(savedPhoto);
        });

        test('UTC-27-02: throws an error when tripId is missing', async () => {
            const file = { originalname: 'testphoto.jpg' };

            await expect(tripSummaryService.savePhoto(null, 1, file)).rejects.toThrow('Trip ID is required');
            expect(uploadImage).not.toHaveBeenCalled();
            expect(daoMock.insertPhoto).not.toHaveBeenCalled();
        });

        test('UTC-27-03: throws an error when photo URL is missing or empty', async () => {
            await expect(tripSummaryService.savePhoto(1, 1, null)).rejects.toThrow('Photo is required');
            expect(uploadImage).not.toHaveBeenCalled();
            expect(daoMock.insertPhoto).not.toHaveBeenCalled();
        });

        test('UTC-27-04: throws an error when userId is missing', async () => {
            const file = { originalname: 'testphoto.jpg' };

            await expect(tripSummaryService.savePhoto(1, null, file)).rejects.toThrow('User ID is required');
            expect(uploadImage).not.toHaveBeenCalled();
            expect(daoMock.insertPhoto).not.toHaveBeenCalled();
        });
    });

    describe('UTC-28: getPhotosByTrip', () => {
        test('UTC-28-01: retrieves photos successfully for a trip with photos', async () => {
            const photos = [
                { tripId: 1, photoUrl: 'https://example.com/test-1.jpeg' },
                { tripId: 1, photoUrl: 'https://example.com/test-2.jpeg' },
            ];
            daoMock.getPhotosByTrip.mockResolvedValue(photos);

            const result = await tripSummaryService.getPhotosByTrip(1);

            expect(daoMock.getPhotosByTrip).toHaveBeenCalledWith(1);
            expect(result).toEqual(photos);
        });

        test('UTC-28-02: retrieves photos for a trip with no photos', async () => {
            daoMock.getPhotosByTrip.mockResolvedValue([]);

            const result = await tripSummaryService.getPhotosByTrip(2);

            expect(result).toEqual([]);
        });

        test('UTC-28-03: throws an error when tripId is missing', async () => {
            await expect(tripSummaryService.getPhotosByTrip(null)).rejects.toThrow('Trip ID is required');
        });

        test('UTC-28-04: throws an error when the retrieval fails', async () => {
            daoMock.getPhotosByTrip.mockRejectedValue(new Error('Database unavailable'));

            await expect(tripSummaryService.getPhotosByTrip(1)).rejects.toThrow('Database unavailable');
        });
    });

    describe('UTC-29: setAwards', () => {
        const validSummary = {
            members: [{ user_id: 1 }, { user_id: 2 }],
            activities: [
                {
                    user_id: 1,
                    location_name: 'Ang Kaew',
                    ac_start_time: '2024-01-01T09:00:00.000Z',
                    ac_end_time: '2024-01-01T10:00:00.000Z'
                },
                {
                    user_id: 1,
                    location_name: 'Phu Kradueng',
                    ac_start_time: '2024-01-02T09:00:00.000Z',
                    ac_end_time: '2024-01-02T11:00:00.000Z'
                },
                {
                    user_id: 2,
                    location_name: 'Doi Suthep',
                    ac_start_time: '2024-01-01T09:00:00.000Z',
                    ac_end_time: '2024-01-01T09:30:00.000Z'
                }
            ],
            awards: [],
            stops: [
                { user_id: 1, latitude: 18.796, longitude: 98.955, entered_at: '2024-01-01T08:00:00Z' },
                { user_id: 1, latitude: 18.800, longitude: 98.960, entered_at: '2024-01-01T12:00:00Z' },
                { user_id: 2, latitude: 18.790, longitude: 98.950, entered_at: '2024-01-01T08:00:00Z' },
            ],
            photos: [
                { user_id: 1 },
                { user_id: 1 },
                { user_id: 2 }
            ]
        };

        test('UTC-29-01: sets awards successfully based on trip stats', async () => {
            daoMock.getSummaryByTrip.mockResolvedValue(validSummary);
            daoMock.setAward.mockResolvedValue({ awardId: 1 });

            const result = await tripSummaryService.setAwards(1);

            expect(daoMock.getSummaryByTrip).toHaveBeenCalledWith(1);
            expect(daoMock.setAward).toHaveBeenCalledTimes(5);
            expect(result).toHaveLength(5);
        });

        test('UTC-29-02: does not set an award when the trip has no qualifying stats', async () => {
            const emptySummary = {
                members: [{ user_id: 1 }],
                activities: [],
                awards: [],
                stops: [],
                photos: []
            };
            daoMock.getSummaryByTrip.mockResolvedValue(emptySummary);

            const result = await tripSummaryService.setAwards(1);

            expect(result).toHaveLength(5);
            expect(daoMock.setAward).toHaveBeenCalledTimes(5);
        });

        test('UTC-29-03: throws an error when tripId is missing', async () => {
            await expect(tripSummaryService.setAwards(null)).rejects.toThrow('Trip ID is required');
        });

        test('UTC-29-04: throws an error when the summary retrieval fails', async () => {
            daoMock.getSummaryByTrip.mockRejectedValue(new Error('Summary lookup failed'));

            await expect(tripSummaryService.setAwards(1)).rejects.toThrow('Summary lookup failed');
        });
    });

    describe('UTC-30: getAwardsByTrip', () => {
        test('UTC-30-01: retrieves awards successfully for a trip with awards', async () => {
            const awards = [
                { tripId: 1, userId: 1, awardName: 'View hunter' },
                { tripId: 1, userId: 2, awardName: 'foodie supreme' },
            ];
            daoMock.getAwardsByTrip.mockResolvedValue(awards);

            const result = await tripSummaryService.getAwardsByTrip(1);

            expect(daoMock.getAwardsByTrip).toHaveBeenCalledWith(1);
            expect(result).toEqual(awards);
        });

        test('UTC-30-02: retrieves awards for a trip with no awards', async () => {
            daoMock.getAwardsByTrip.mockResolvedValue([]);

            const result = await tripSummaryService.getAwardsByTrip(1);

            expect(result).toEqual([]);
        });

        test('UTC-30-03: throws an error when tripId is missing', async () => {
            await expect(tripSummaryService.getAwardsByTrip(null)).rejects.toThrow('Trip ID is required');
        });

        test('UTC-30-04: throws an error when the retrieval fails', async () => {
            daoMock.getAwardsByTrip.mockRejectedValue(new Error('Failed to fetch awards'));

            await expect(tripSummaryService.getAwardsByTrip(1)).rejects.toThrow('Failed to fetch awards');
        });
    });

    describe('UTC-31: getSummaryByTrip', () => {
        test('UTC-31-01: retrieves trip summary successfully for a completed trip', async () => {
            const summary = {
                trips: [{ trip_id: 1, trip_name: 'Trip A' }],
                members: [{ user_id: 1 }],
                activities: [{ location_name: 'Ang Kaew' }],
                awards: [],
                stops: [],
                photos: []
            };
            daoMock.getSummaryByTrip.mockResolvedValue(summary);

            const result = await tripSummaryService.getSummaryByTrip(1);

            expect(daoMock.getSummaryByTrip).toHaveBeenCalledWith(1);
            expect(result).toEqual(summary);
        });

        test('UTC-31-02: retrieves summary for a trip with zero recorded activity', async () => {
            const summary = {
                trips: [{ trip_id: 2, trip_name: 'Trip B' }],
                members: [],
                activities: [],
                awards: [],
                stops: [],
                photos: []
            };
            daoMock.getSummaryByTrip.mockResolvedValue(summary);

            const result = await tripSummaryService.getSummaryByTrip(2);

            expect(result).toEqual(summary);
        });

        test('UTC-31-03: throws an error when tripId is missing', async () => {
            await expect(tripSummaryService.getSummaryByTrip(null)).rejects.toThrow('Trip ID is required');
        });

        test('UTC-31-04: throws an error when the retrieval fails', async () => {
            daoMock.getSummaryByTrip.mockRejectedValue(new Error('Summary failed'));

            await expect(tripSummaryService.getSummaryByTrip(1)).rejects.toThrow('Summary failed');
        });
    });

    describe('UTC-32: getActivityGraphData', () => {
        test('UTC-32-01: retrieves activity graph data successfully for a trip and user', async () => {
            const graphData = {
                totalActivityTypes: 1,
                activityTypeCounts: [{ activityType: 'sight seeing', count: 2 }]
            };
            daoMock.getActivityTypeCounts.mockResolvedValue(graphData.activityTypeCounts);

            const result = await tripSummaryService.getActivityGraphData(1, 1);

            expect(daoMock.getActivityTypeCounts).toHaveBeenCalledWith(1, 1);
            expect(result).toEqual(graphData);
        });

        test('UTC-32-02: retrieves activity graph data for a user with no recorded activities', async () => {
            daoMock.getActivityTypeCounts.mockResolvedValue([]);

            const result = await tripSummaryService.getActivityGraphData(1, 10);

            expect(result).toEqual({ totalActivityTypes: 0, activityTypeCounts: [] });
        });

        test('UTC-32-03: throws an error when tripId is missing', async () => {
            await expect(tripSummaryService.getActivityGraphData(null, 1)).rejects.toThrow('Trip ID is required');
        });

        test('UTC-32-04: throws an error when userId is missing', async () => {
            await expect(tripSummaryService.getActivityGraphData(1, null)).rejects.toThrow('User ID is required');
        });

        test('UTC-32-05: throws an error when the retrieval fails', async () => {
            daoMock.getActivityTypeCounts.mockRejectedValue(new Error('Activity counts failed'));

            await expect(tripSummaryService.getActivityGraphData(1, 1)).rejects.toThrow('Activity counts failed');
        });
    });

    describe('UTC-33: getStoryData', () => {
        const storySummary = {
            trips: [{ trip_id: 1, trip_name: 'Trip A' }],
            members: [{ user_id: 1 }],
            activities: [{ location_name: 'Ang Kaew', activity_type: 'sight seeing' }],
            awards: [],
            stops: [],
            photos: []
        };

        test('UTC-33-01: retrieves story data successfully for a trip', async () => {
            const photos = [{ photoUrl: 'https://example.com/test-1.jpeg' }, { photoUrl: 'https://example.com/test-2.jpeg' }];
            const awards = [{ awardName: 'View hunter' }, { awardName: 'foodie supreme' }];
            const activityTypeCounts = [{ activityType: 'sight seeing', count: 1 }];

            daoMock.getSummaryByTrip
                .mockResolvedValueOnce(storySummary)
                .mockResolvedValueOnce(storySummary);
            daoMock.getPhotosByTrip.mockResolvedValue(photos);
            daoMock.getAwardsByTrip.mockResolvedValue(awards);
            daoMock.getActivityTypeCounts.mockResolvedValue(activityTypeCounts);
            daoMock.setAward.mockResolvedValue({ awardId: 1 });

            const result = await tripSummaryService.getStoryData(1, 1);

            expect(daoMock.getSummaryByTrip).toHaveBeenCalledWith(1);
            expect(result).toEqual({
                ...storySummary,
                photos,
                awards,
                activityTypeCounts
            });
        });

        test('UTC-33-02: retrieves story data for a trip with no recorded activities', async () => {
            const emptySummary = {
                trips: [{ trip_id: 2, trip_name: 'Trip B' }],
                members: [{ user_id: 1 }],
                activities: [],
                awards: [],
                stops: [],
                photos: []
            };
            daoMock.getSummaryByTrip
                .mockResolvedValueOnce(emptySummary)
                .mockResolvedValueOnce(emptySummary);
            daoMock.getPhotosByTrip.mockResolvedValue([]);
            daoMock.getAwardsByTrip.mockResolvedValue([]);
            daoMock.getActivityTypeCounts.mockResolvedValue([]);
            daoMock.setAward.mockResolvedValue({ awardId: 1 });

            const result = await tripSummaryService.getStoryData(2, 1);

            expect(result).toEqual({
                ...emptySummary,
                photos: [],
                awards: [],
                activityTypeCounts: []
            });
        });

        test('UTC-33-03: throws an error when tripId is missing', async () => {
            await expect(tripSummaryService.getStoryData(null, 1)).rejects.toThrow('Trip ID is required');
        });

        test('UTC-33-04: throws an error when userId is missing', async () => {
            await expect(tripSummaryService.getStoryData(1, null)).rejects.toThrow('User ID is required');
        });

        test('UTC-33-05: throws an error when the retrieval fails', async () => {
            daoMock.getSummaryByTrip.mockRejectedValue(new Error('Story data failed'));

            await expect(tripSummaryService.getStoryData(1, 1)).rejects.toThrow('Story data failed');
        });
    });
});
