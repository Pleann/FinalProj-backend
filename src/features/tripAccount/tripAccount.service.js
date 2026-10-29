const tripAccountDAO = require('./tripAccount.dao');
const uploadImage = require('../../util/uploadImage');
const { AccountEntity } = require('./tripAccount.entity');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '90d';
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const OTP_SECRET = process.env.OTP_SECRET;

const OTP_EXPIRY_MINUTES = 5;
const RESET_TOKEN_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});


// (async () => {
//     const hash = await bcrypt.hash('notSecurePassword6', 10);
//     console.log(hash);
// })();

//add error catching!!
class tripAccountService {
    constructor() {
        this.dao = new tripAccountDAO();
    }

    // Generate an HMAC hash so OTPs and reset tokens
    // are never stored as plaintext in the database.
    hashResetValue(value) {
        if (!OTP_SECRET) {
            throw new Error('OTP_SECRET is not configured');
        }

        return crypto
            .createHmac('sha256', OTP_SECRET)
            .update(value)
            .digest('hex');
    }

    // Compare hashes safely
    compareResetHashes(hash1, hash2) {
        const buffer1 = Buffer.from(hash1, 'hex');
        const buffer2 = Buffer.from(hash2, 'hex');

        if (buffer1.length !== buffer2.length) {
            return false;
        }

        return crypto.timingSafeEqual(buffer1, buffer2);
    }

    // Send the OTP to the user's email
    async sendPasswordResetOtp(email, otp) {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'RoamiO Password Reset OTP',
            text: `Your RoamiO password reset code is ${otp}. It will expire in ${OTP_EXPIRY_MINUTES} minutes.`,
            html: `
            <h2>RoamiO Password Reset</h2>
            <p>Use the following code to reset your password:</p>
            <h1>${otp}</h1>
            <p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
            <p>If you did not request a password reset, you can ignore this email.</p>
        `
        });
    }

    async createAccount(firstName, lastName, username, email, password, file) {
        if (!firstName || !username || !email || !password) {
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

        console.log('LOGIN USERNAME:', username);

        const row = await this.dao.findAuthByUsername(username);
        console.log('LOGIN ROW:', row ? {
                user_id: row.user_id,
                username: row.username,
                hasPassword: !!row.password,
                passwordLength: row.password?.length,
            } : null);
        if (!row) {
            throw new Error('Invalid username or password');
        }

        const isMatch = await bcrypt.compare(password, row.password);
        console.log('PASSWORD MATCH:', isMatch);
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

    async getLeaderboard(limit) {
        return this.dao.getLeaderboard(limit);
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

    async forgotPassword(email) {
        if (!email) {
            throw new Error('Email is required');
        }

        const account = await this.dao.findAccountByEmail(email);

        // Use the same response whether the account exists or not.
        const response = {
            message: 'If an account exists with this email, a reset OTP has been sent.'
        };

        if (!account) {
            return response;
        }

        // Generate a six-digit OTP
        const otp = crypto.randomInt(100000, 1000000).toString();

        const otpHash = this.hashResetValue(otp);

        const expiresAt = new Date(
            Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
        );

        // Save the OTP hash before sending the email
        await this.dao.savePasswordResetOtp(
            account.user_id,
            otpHash,
            expiresAt
        );

        await this.sendPasswordResetOtp(account.email, otp);

        return response;
    }

    async verifyResetOtp(email, otp) {
        if (!email || !otp) {
            throw new Error('Email and OTP are required');
        }

        if (!/^\d{6}$/.test(otp)) {
            throw new Error('Invalid or expired OTP');
        }

        const account = await this.dao.findPasswordResetByEmail(email);

        if (!account || !account.reset_otp_hash) {
            throw new Error('Invalid or expired OTP');
        }

        // Check expiry
        if (new Date(account.reset_otp_expires_at) <= new Date()) {
            throw new Error('Invalid or expired OTP');
        }

        // Check attempt limit
        if (account.reset_otp_attempts >= MAX_OTP_ATTEMPTS) {
            throw new Error('Maximum OTP attempts exceeded');
        }

        const submittedOtpHash = this.hashResetValue(otp);

        // Check whether the OTP matches
        if (!this.compareResetHashes(
            submittedOtpHash,
            account.reset_otp_hash
        )) {
            await this.dao.incrementPasswordResetAttempts(account.user_id);

            throw new Error('Invalid or expired OTP');
        }

        // Generate a secure random reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        const tokenHash = this.hashResetValue(resetToken);

        const expiresAt = new Date(
            Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
        );

        const saved = await this.dao.saveVerifiedResetToken(
            account.user_id,
            account.reset_otp_hash,
            tokenHash,
            expiresAt
        );

        if (!saved) {
            throw new Error('Invalid or expired OTP');
        }

        // Return the plaintext token only to the client.
        // The database stores its hash.
        return {
            message: 'OTP verified successfully',
            resetToken
        };
    }

    async resetPassword(resetToken, newPassword) {
        if (!resetToken || !newPassword) {
            throw new Error('Reset token and new password are required');
        }

        if (newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }

        const tokenHash = this.hashResetValue(resetToken);

        const hashedPassword = await bcrypt.hash(
            newPassword,
            SALT_ROUNDS
        );

        const updated = await this.dao.updatePasswordAndClearReset(
            tokenHash,
            hashedPassword
        );

        if (!updated) {
            throw new Error('Invalid or expired reset token');
        }

        return {
            message: 'Password reset successfully'
        };
    }
}

module.exports = tripAccountService;