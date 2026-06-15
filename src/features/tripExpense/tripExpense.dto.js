const VALID_CURRENCIES = ['฿', '$', '€', '£', '¥', '₩'];

class CreateExpenseDto {
    constructor({ userId, activityId, expenseName, amount, currency, expenseTimestamp }) {
        if (!userId)      throw new Error('userId is required');
        if (!expenseName) throw new Error('expenseName is required');
        if (!amount)      throw new Error('amount is required');
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            throw new Error('amount must be a positive number');
        }
        if (currency && !VALID_CURRENCIES.includes(currency)) {
            throw new Error(`Invalid currency. Must be one of: ${VALID_CURRENCIES.join(', ')}`);
        }

        this.userId            = userId;
        this.activityId        = activityId ?? null;
        this.expenseName       = expenseName.trim();
        this.amount            = parseFloat(amount);
        this.currency          = currency ?? '฿';
        this.expenseTimestamp  = expenseTimestamp ? new Date(expenseTimestamp) : new Date();
    }
}

class UpdateExpenseDto {
    constructor({ expenseName, amount, currency, activityId, expenseTimestamp }) {
        if (amount !== undefined) {
            if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
                throw new Error('amount must be a positive number');
            }
        }
        if (currency && !VALID_CURRENCIES.includes(currency)) {
            throw new Error(`Invalid currency. Must be one of: ${VALID_CURRENCIES.join(', ')}`);
        }

        this.expenseName      = expenseName?.trim();
        this.amount           = amount ? parseFloat(amount) : undefined;
        this.currency         = currency;
        this.activityId       = activityId;
        this.expenseTimestamp = expenseTimestamp ? new Date(expenseTimestamp) : undefined;
    }
}

class ExpenseResponseDto {
    constructor(expense) {
        this.expenseId        = expense.expenseId;
        this.tripId           = expense.tripId;
        this.userId           = expense.userId;
        this.activityId       = expense.activityId;
        this.expenseName      = expense.expenseName;
        this.amount           = expense.amount;
        this.currency         = expense.currency;
        this.billImageUrl     = expense.billImageUrl;
        this.expenseTimestamp = expense.expenseTimestamp;
    }
}

module.exports = {
    CreateExpenseDto,
    UpdateExpenseDto,
    ExpenseResponseDto,
};