const express = require('express');
const TripAccountController = require('./tripAccount.controller');
const upload = require('../../middleware/upload.middleware');

const router = express.Router();
const tripAccountController = new TripAccountController();
const authenticate = require('../../middleware/auth.middleware');

router.post('/', upload.single('profilePicture'), (req, res) => tripAccountController.createAccount(req, res));
router.patch('/:userId', authenticate, upload.single('profilePicture'), (req, res) => tripAccountController.updateAccount(req, res));
router.post('/login', (req, res) => tripAccountController.login(req, res));
router.get('/:userId', (req, res) => tripAccountController.getAccountById(req, res));
router.get('/all', (req, res) => tripAccountController.getAllAccounts(req, res));
router.get('/:userId/trips', (req, res) => tripAccountController.getAccountTrips(req, res));
router.get('/checkUsername', (req, res) => tripAccountController.checkUsername(req, res));
router.get('/checkEmail', (req, res) => tripAccountController.checkEmail(req, res));
router.get('/:userId/awards', authenticate, (req, res) => tripAccountController.getAwardsByUserId(req, res));
router.delete('/:userId', (req, res) => tripAccountController.deleteAccount(req, res));

module.exports = router;