const express = require('express');
const TripNotificationController = require('./tripNotification.controller');

const router = express.Router({ mergeParams: true });
const tripNotificationController = new TripNotificationController();
const authenticate = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/', (req, res) => tripNotificationController.getNotifications(req, res));
// router.get('/unread',         (req, res) => TripNotificationController.getUnreadNotifications(req, res));
// router.patch('/read-all',     (req, res) => TripNotificationController.markAllAsRead(req, res));
// router.patch('/:notificationId/read', (req, res) => TripNotificationController.markAsRead(req, res));
router.delete('/:notificationId', (req, res) => tripNotificationController.deleteNotification(req, res));

module.exports = router;