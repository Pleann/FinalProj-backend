class ExpenseEntity {
    constructor(row) {
        this.expenseId        = row.expense_id;
        this.tripId           = row.trip_id;
        this.userId           = row.user_id;
        this.activityId       = row.activity_id;
        this.expenseName      = row.expense_name;
        this.amount           = row.amount;
        this.currency         = row.currency;
        this.billImageUrl     = row.billimage_url;
        this.expenseTimestamp = row.expense_timestamp;
    }
}

module.exports = ExpenseEntity;