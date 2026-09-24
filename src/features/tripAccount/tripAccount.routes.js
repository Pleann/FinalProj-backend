const express = require('express');
const TripAccountController = require('./tripAccount.controller');

const router = express.Router();
const tripAccountController = new TripAccountController();

router.post('/account', (req, res) => tripAccountController.createAccount(req, res));
router.patch('/account/:userId', (req, res) => tripAccountController.updateAccount(req, res));
router.get('/account/:userId', (req, res) => tripAccountController.getAccountById(req, res));
router.get('/allAccounts', (req, res) => tripAccountController.getAllAccounts(req, res));
router.delete('/account/:userId', (req, res) => tripAccountController.deleteAccount(req, res));

module.exports = router;