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
}

module.exports = TripAccountController;