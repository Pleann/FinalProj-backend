const TripExpenseService = require('./tripExpense.service');
const {
    CreateExpenseDto,
    UpdateExpenseDto,
    ExpenseResponseDto,
} = require('./tripExpense.dto');

class TripExpenseController {
    constructor() {
        this.expenseService = new TripExpenseService();
    }

    // ── POST /trips/:tripId/expenses ──────────────────────────────────────────
    async createExpense(req, res) {
        try {
            const { tripId } = req.params;
            const createExpenseDto        = new CreateExpenseDto(req.body);
            const expense    = await this.expenseService.createExpense(tripId, createExpenseDto);
            res.status(201).json({
                message: 'Expense created successfully',
                expense: new ExpenseResponseDto(expense),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // ── GET /trips/:tripId/expenses ───────────────────────────────────────────
    async getExpensesByTrip(req, res) {
        try {
            const { tripId } = req.params;
            const expenses   = await this.expenseService.getExpensesByTrip(tripId);
            res.status(200).json(expenses.map(e => new ExpenseResponseDto(e)));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // ── GET /trips/:tripId/expenses/activity/:activityId ──────────────────────
    async getExpensesByActivity(req, res) {
        try {
            const { activityId } = req.params;
            const expenses       = await this.expenseService.getExpensesByActivity(activityId);
            res.status(200).json(expenses.map(e => new ExpenseResponseDto(e)));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // ── PATCH /trips/:tripId/expenses/:expenseId ──────────────────────────────
    async updateExpense(req, res) {
        try {
            const { expenseId } = req.params;
            const dto           = new UpdateExpenseDto(req.body);
            const expense       = await this.expenseService.updateExpense(expenseId, dto);
            res.status(200).json({
                message: 'Expense updated successfully',
                expense: new ExpenseResponseDto(expense),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // ── DELETE /trips/:tripId/expenses/:expenseId ─────────────────────────────
    async deleteExpense(req, res) {
        try {
            const { expenseId } = req.params;
            await this.expenseService.deleteExpense(expenseId);
            res.status(200).json({ message: 'Expense deleted successfully' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // ── POST /trips/:tripId/expenses/:expenseId/receipt ───────────────────────
    async uploadReceipt(req, res) {
        try {
            const { expenseId } = req.params;
            if (!req.file) throw new Error('Receipt image is required');
            const expense = await this.expenseService.uploadReceipt(expenseId, req.file);
            res.status(200).json({
                message: 'Receipt uploaded successfully',
                expense: new ExpenseResponseDto(expense),
            });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // ── GET /trips/:tripId/expenses/:expenseId/receipt ────────────────────────
    async getReceipt(req, res) {
        try {
            const { expenseId } = req.params;
            const url           = await this.expenseService.getReceipt(expenseId);
            res.status(200).json({ billImageUrl: url });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    // ── DELETE /trips/:tripId/expenses/:expenseId/receipt ─────────────────────
    async deleteReceipt(req, res) {
        try {
            const { expenseId } = req.params;
            await this.expenseService.deleteReceipt(expenseId);
            res.status(200).json({ message: 'Receipt deleted successfully' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}

module.exports = TripExpenseController;