const tripAccountDAO = require('./tripAccount.dao');
const uploadImage = require('../../util/uploadImage');
const bcrypt = require('bcrypt');


//add error catching!!
class tripAccountService {
    constructor() {
        this.dao = new tripAccountDAO();
    }

    async createAccount(firstName, lastName, username, email, password, file) {
        if (!firstName || !lastName || !username || !email || !password) {
            throw new Error('All fields are required');
        }
        const profilePictureUrl = file ? await uploadImage(file, 'profile-photos') : null;
        const hashedPassword = await bcrypt.hash(password, 10);

        return this.dao.insertAccount({
            firstName, lastName, username, email,
            password: hashedPassword,
            profilePictureUrl,
        });
    }

    async updateAccount(userId, fields, file) {
        const { firstName, lastName, username, email, password } = fields;
        const profilePictureUrl = file ? await uploadImage(file, 'profile-photos') : null;
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

        return this.dao.updateAccount(
            userId, firstName, lastName, username, email, hashedPassword, profilePictureUrl
        );
    }

    async getAccountById(userId) {
        return await this.dao.findAccountById(userId);
    }

    async getAllAccounts() {
        return await this.dao.findAllAccounts();
    }

    async getAccountTrips(userId) {
        if (!userId) throw new Error('User ID is required');
        return await this.dao.findTripsByAccount(userId);
    }

    async deleteAccount(userId) {
        return await this.dao.deleteAccount(userId);
    }
}

module.exports = tripAccountService;