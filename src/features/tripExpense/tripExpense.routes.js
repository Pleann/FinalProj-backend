const express              = require('express');
const TripExpenseController = require('./tripExpense.controller');
const upload               = require('../../middleware/upload.middleware');

const router             = express.Router({ mergeParams: true });
const expenseController  = new TripExpenseController();

router.post('/',                                (req, res) => expenseController.createExpense(req, res));
router.get('/',                                 (req, res) => expenseController.getExpensesByTrip(req, res));
router.get('/activity/:activityId',             (req, res) => expenseController.getExpensesByActivity(req, res));
router.patch('/:expenseId',                     (req, res) => expenseController.updateExpense(req, res));
router.delete('/:expenseId',                    (req, res) => expenseController.deleteExpense(req, res));
router.post('/:expenseId/receipt',  upload.single('receipt'), (req, res) => expenseController.uploadReceipt(req, res));
router.get('/:expenseId/receipt',                             (req, res) => expenseController.getReceipt(req, res));
router.delete('/:expenseId/receipt',                          (req, res) => expenseController.deleteReceipt(req, res));

module.exports = router;