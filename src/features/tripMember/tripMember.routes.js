const express = require('express');
const TripMemberController = require('./tripMember.controller');

const router = express.Router({ mergeParams: true });
const tripMemberController = new TripMemberController();

router.get('/', (req, res) => tripMemberController.getMembersByTrip(req, res));
router.patch('/:participantId', (req, res) => tripMemberController.updateMemberStatus(req, res));
router.delete('/:participantId', (req, res) => tripMemberController.removeMember(req, res));

module.exports = router;