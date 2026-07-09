const express              = require('express');
const tripNotificationController = require('./tripNotification.controller');

const router               = express.Router({ mergeParams: true }); // inherit :userId from parent
const TripNotificationController = new tripNotificationController();

router.get('/',               (req, res) => TripNotificationController.getNotifications(req, res));
// router.get('/unread',         (req, res) => TripNotificationController.getUnreadNotifications(req, res));
// router.patch('/read-all',     (req, res) => TripNotificationController.markAllAsRead(req, res));
// router.patch('/:notificationId/read', (req, res) => TripNotificationController.markAsRead(req, res));
router.delete('/:notificationId',     (req, res) => TripNotificationController.deleteNotification(req, res));

module.exports = router;