const TripExpenseDao = require('./tripExpense.dao');

class TripExpenseRepository {
    constructor() {
        this.dao = new TripExpenseDao();
    }

    async save(tripId, createExpenseDto) {
        return this.dao.insert(tripId, createExpenseDto);
    }

    async findByActivity(activityId) {
        return this.dao.findByActivity(activityId);
    }

    async findByTrip(tripId) {
        return this.dao.findByTrip(tripId);
    }

    async findById(expenseId) {
        return this.dao.findById(expenseId);
    }

    async update(expenseId, fields) {
        return this.dao.update(expenseId, fields);
    }

    async delete(expenseId) {
        return this.dao.delete(expenseId);
    }
}

module.exports = TripExpenseRepository;