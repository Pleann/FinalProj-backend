const tripAccountDAO = require('./tripAccount.dao');


//add error catching!!
class tripAccountService {
    constructor() {
        this.dao = new tripAccountDAO();
    }

    async createAccount(firstName, lastName, username, email, password) {
        const tripAccount = {
            firstName,
            lastName,
            username,
            email,
            password
        };
        return await this.dao.insertAccount(tripAccount);
    }

    async updateAccount(userId, fields) {
        return await this.dao.updateAccount(userId, fields);
    }

    async getAccountById(userId) {
        return await this.dao.findAccountById(userId);
    }

    async getAllAccounts() {
        return await this.dao.findAllAccounts();
    }

    async deleteAccount(userId) {
        return await this.dao.deleteAccount(userId);
    }
}

module.exports = tripAccountService;