const pool          = require('../../config/db');
const ExpenseEntity = require('./tripExpense.entity');

const VALID_CURRENCIES = ['฿', '$', '€', '£', '¥', '₩'];

class TripExpenseDao {

    async insert(tripId, createExpenseDto) {
        if (currency && !VALID_CURRENCIES.includes(currency)) {
            throw new Error(`Invalid currency. Must be one of: ${VALID_CURRENCIES.join(', ')}`);
        }
        const { rows } = await pool.query(
            `INSERT INTO Expense (trip_id, user_id, activity_id, expense_name, amount, currency, expense_timestamp)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [tripId, createExpenseDto.userId, createExpenseDto.activityId, createExpenseDto.expenseName, createExpenseDto.amount, createExpenseDto.currency ?? '฿', createExpenseDto.expenseTimestamp ?? new Date()]
        );
        return new ExpenseEntity(rows[0]);
    }

    async findByActivity(activityId) {
        const { rows } = await pool.query(
            `SELECT * FROM Expense WHERE activity_id = $1 ORDER BY expense_timestamp ASC`,
            [activityId]
        );
        return rows.map(row => new ExpenseEntity(row));
    }

    async findByTrip(tripId) {
        const { rows } = await pool.query(
            `SELECT * FROM Expense WHERE trip_id = $1 ORDER BY expense_timestamp ASC`,
            [tripId]
        );
        return rows.map(row => new ExpenseEntity(row));
    }

    async findById(expenseId) {
        const { rows } = await pool.query(
            `SELECT * FROM Expense WHERE expense_id = $1`,
            [expenseId]
        );
        return rows.length ? new ExpenseEntity(rows[0]) : null;
    }

    async update(expenseId, fields) {
        const keys      = Object.keys(fields);
        const values    = Object.values(fields);
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        values.push(expenseId);
        const { rows } = await pool.query(
            `UPDATE Expense SET ${setClause} WHERE expense_id = $${values.length} RETURNING *`,
            values
        );
        if (rows.length === 0) throw new Error('Expense not found');
        return new ExpenseEntity(rows[0]);
    }

    async delete(expenseId) {
        const { rows } = await pool.query(
            `DELETE FROM Expense WHERE expense_id = $1 RETURNING *`,
            [expenseId]
        );
        if (rows.length === 0) throw new Error('Expense not found');
        return new ExpenseEntity(rows[0]);
    }
}

module.exports = TripExpenseDao;