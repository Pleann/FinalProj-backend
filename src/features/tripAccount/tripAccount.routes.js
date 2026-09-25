const express = require('express');
const TripAccountController = require('./tripAccount.controller');

const router = express.Router();
const tripAccountController = new TripAccountController();

router.post('/', (req, res) => tripAccountController.createAccount(req, res));
router.patch('/:userId', (req, res) => tripAccountController.updateAccount(req, res));
router.get('/:userId', (req, res) => tripAccountController.getAccountById(req, res));
router.get('/all', (req, res) => tripAccountController.getAllAccounts(req, res));
router.delete('/:userId', (req, res) => tripAccountController.deleteAccount(req, res));

module.exports = router;