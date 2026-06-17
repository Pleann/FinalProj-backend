const TripExpenseRepository = require('./tripExpense.repository');
const uploadImage           = require('../../util/uploadImage');
const supabase              = require('../../config/supabase');

class TripExpenseService {
    constructor() {
        this.expenseRepo = new TripExpenseRepository();
    }

    // ── createExpense ─────────────────────────────────────────────────────────
    async createExpense(tripId, createExpenseDto) {
        // notification lives at tripActivity

        return this.expenseRepo.save(
            tripId,
            createExpenseDto.userId,
            createExpenseDto.activityId   ?? null,
            createExpenseDto.expenseName,
            createExpenseDto.amount,
            createExpenseDto.currency,
            createExpenseDto.expenseTimestamp,
        );
    }

    // ── getExpensesByActivity ─────────────────────────────────────────────────
    async getExpensesByActivity(activityId) {
        if (!activityId) throw new Error('Could not fetch expense by activityId')
        return this.expenseRepo.findByActivity(activityId);
    }

    // ── getExpensesByTrip ─────────────────────────────────────────────────────
    async getExpensesByTrip(tripId) {
        if (!tripId) throw new Error('Could not fetch expense by tripId')
        return this.expenseRepo.findByTrip(tripId);
    }

    // ── updateExpense ─────────────────────────────────────────────────────────
    async updateExpense(expenseId, body) {
        const fields = {};
        if (body.expenseName)      fields.expense_name      = body.expenseName.trim();
        if (body.amount)           fields.amount            = body.amount;
        if (body.currency)         fields.currency          = body.currency;
        if (body.activityId)       fields.activity_id       = body.activityId;
        if (body.expenseTimestamp) fields.expense_timestamp = body.expenseTimestamp;

        if (Object.keys(fields).length === 0) {
            throw new Error('No fields provided to update');
        }

        return this.expenseRepo.update(expenseId, fields);
    }

    // ── deleteExpense ─────────────────────────────────────────────────────────
    async deleteExpense(expenseId) {
        const expense = await this.expenseRepo.findById(expenseId);
        if (!expense) throw new Error('Expense not found');

        if (expense.billImageUrl) {
            await this._deleteFromStorage(expense.billImageUrl);
        }

        return this.expenseRepo.delete(expenseId);
    }

    // ── uploadReceipt ─────────────────────────────────────────────────────────
    async uploadReceipt(expenseId, file) {
        const expense = await this.expenseRepo.findById(expenseId);
        if (!expense) throw new Error('Expense not found');

        if (expense.billImageUrl) {
            await this._deleteFromStorage(expense.billImageUrl);
        }

        const publicUrl = await uploadImage(file, 'receipts');

        return this.expenseRepo.update(expenseId, { billimage_url: publicUrl });
    }

    // ── getReceipt ────────────────────────────────────────────────────────────
    async getReceipt(expenseId) {
        const expense = await this.expenseRepo.findById(expenseId);
        if (!expense) throw new Error('Expense not found');
        if (!expense.billImageUrl) throw new Error('No receipt found for this expense');
        return expense.billImageUrl;
    }

    // ── deleteReceipt ─────────────────────────────────────────────────────────
    async deleteReceipt(expenseId) {
        const expense = await this.expenseRepo.findById(expenseId);
        if (!expense) throw new Error('Expense not found');
        if (!expense.billImageUrl) throw new Error('No receipt found for this expense');

        await this._deleteFromStorage(expense.billImageUrl);

        return this.expenseRepo.update(expenseId, { billimage_url: null });
    }

    // ── _deleteFromStorage (private) ──────────────────────────────────────────
    async _deleteFromStorage(publicUrl) {
        const bucket  = process.env.SUPABASE_BUCKET;
        const marker  = `${bucket}/`;
        const idx     = publicUrl.indexOf(marker);
        if (idx === -1) throw new Error('Could not parse receipt file path');
        const filePath = publicUrl.slice(idx + marker.length);

        const { error } = await supabase.storage.from(bucket).remove([filePath]);
        if (error) throw new Error(`Storage deletion failed: ${error.message}`);
    }
}

module.exports = TripExpenseService;