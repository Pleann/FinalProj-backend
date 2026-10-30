const TripAccountService = require('./tripAccount.service');

class TripAccountController {
    constructor() {
        this.tripAccountService = new TripAccountService();
    }

    async createAccount(req, res) {
        try {
            const { firstName, lastName, username, email, password } = req.body;
            const account = await this.tripAccountService.createAccount(firstName, lastName, username, email, password, req.file);
            res.status(201).json({message: 'Account created successfully', account});
        } catch (err) {
            res.status(400).json({error: err.message});
        }
    }

    async updateAccount(req, res) {
        try {
            const { userId } = req.params;
            if (String(req.user.userId) !== String(userId)) {
                return res.status(403).json({ error: 'You can only update your own account' });
            }
            const account = await this.tripAccountService.updateAccount(userId, req.body, req.file);
            res.status(200).json({ message: 'Account updated successfully', account });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const { account, token } = await this.tripAccountService.login(username, password);
            res.status(200).json({ message: 'Login successful', account, token });
        } catch (err) {
            res.status(401).json({ error: err.message });
        }
    }

    async getLeaderboard(req, res) {
        try {
            const limit = parseInt(req.query.limit, 10) || 50;
            const leaderboard = await this.tripAccountService.getLeaderboard(limit);
            res.status(200).json(leaderboard);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getAccountById(req, res) {
        try {
            const {userId} = req.params;
            const account = await this.tripAccountService.getAccountById(userId);
            res.status(200).json(account);
        } catch (err) {
            res.status(404).json({error: err.message});
        }
    }

    async getAllAccounts(req, res) {
        try {
            const accounts = await this.tripAccountService.getAllAccounts();
            res.status(200).json(accounts);
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    }

    async getAccountTrips(req, res) {
        try {
            const { userId } = req.params;
            const trips = await this.tripAccountService.getAccountTrips(userId);
            res.status(200).json(trips);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async checkUsername(req, res) {
        try {
            const { username } = req.query;
            const isTaken = await this.tripAccountService.isUsernameTaken(username);
            res.status(200).json({ isTaken });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async checkEmail(req, res) {
        try {
            const { email } = req.query;
            const isTaken = await this.tripAccountService.isEmailTaken(email);
            res.status(200).json({ isTaken });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async getAwardsByUserId(req, res) {
        try {
            const { userId } = req.params;
            const awards = await this.tripAccountService.getAwardsByUserId(userId);
            res.status(200).json(awards);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async deleteAccount(req, res) {
        try {
            const {userId} = req.params;
            const account = await this.tripAccountService.deleteAccount(userId);
            res.status(200).json({message: 'Account deleted successfully', account});
        } catch (err) {
            res.status(404).json({error: err.message});
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            const result = await this.tripAccountService.forgotPassword(email);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Forgot password error:', error.message);

            return res.status(500).json({
                message: 'Unable to process password reset request'
            });
        }
    }

    async verifyResetOtp(req, res) {
        try {
            const { email, otp } = req.body;

            const result = await this.tripAccountService.verifyResetOtp(
                email,
                otp
            );

            return res.status(200).json(result);
        } catch (error) {
            console.error('Verify reset OTP error:', error.message);

            return res.status(400).json({
                message: error.message
            });
        }
    }

    async resetPassword(req, res) {
        try {
            const { resetToken, newPassword } = req.body;

            const result = await this.tripAccountService.resetPassword(
                resetToken,
                newPassword
            );

            return res.status(200).json(result);
        } catch (error) {
            console.error('Reset password error:', error.message);

            return res.status(400).json({
                message: error.message
            });
        }
    }

    async getScoreHistory(req, res) {
        try {
            const { userId } = req.params;

            const history = await this.service.getScoreHistory(userId);

            return res.status(200).json({
                success: true,
                data: history,
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    }
}

module.exports = TripAccountController;