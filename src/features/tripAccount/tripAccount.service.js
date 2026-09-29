const tripAccountDAO = require('./tripAccount.dao');
const uploadImage = require('../../util/uploadImage');
const { AccountEntity } = require('./tripAccount.entity');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '90d';


//add error catching!!
class tripAccountService {
    constructor() {
        this.dao = new tripAccountDAO();
    }

    async createAccount(firstName, lastName, username, email, password, file) {
        if (!firstName || !lastName || !username || !email || !password) {
            throw new Error('All fields are required');
        }
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }

        const existingUsername = await this.dao.usernameExists(username);
        const existingEmail = await this.dao.emailExists(email);
        if (existingUsername || existingEmail) {
            throw new Error('Username or email already in use');
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const profilePictureUrl = file ? await uploadImage(file, 'profile-photos') : null;

        const tripAccount = {
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            profilePictureUrl,
        };
        return await this.dao.insertAccount(tripAccount);
    }

    async updateAccount(userId, fields, file) {
        const updates = { ...fields };
        if (updates.password) {
            if (updates.password.length < 8) {
                throw new Error('Password must be at least 8 characters');
            }
            updates.password = await bcrypt.hash(updates.password, SALT_ROUNDS);
        }
        if (file) updates.profilePictureUrl = await uploadImage(file, 'profile-photos');
        return this.dao.updateAccount(userId, updates);
    }

    async login(username, password) {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        const row = await this.dao.findAuthByUsername(username);
        if (!row) {
            throw new Error('Invalid username or password');
        }

        const isMatch = await bcrypt.compare(password, row.password);
        if (!isMatch) {
            throw new Error('Invalid username or password');
        }

        const token = jwt.sign(
            { userId: row.user_id },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        const account = new AccountEntity(row);
        return { account, token };
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

    async isUsernameTaken(username) {
        if (!username) throw new Error('Username is required');
        return this.dao.usernameExists(username);
    }

    async isEmailTaken(email) {
        if (!email) throw new Error('Email is required');
        return this.dao.emailExists(email);
    }

    async getAwardsByUserId(userId) {
        if (!userId) throw new Error('User ID is required');
        return await this.dao.findAwardsByUserId(userId);
    }

    async deleteAccount(userId) {
        return await this.dao.deleteAccount(userId);
    }
}

module.exports = tripAccountService;