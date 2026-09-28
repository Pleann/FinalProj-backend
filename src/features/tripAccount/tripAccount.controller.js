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
            const {userId} = req.params;
            const fields = req.body;
            const account = await this.tripAccountService.updateAccount(userId, fields, req.file);
            res.status(200).json({message: 'Account updated successfully', account});
        } catch (err) {
            res.status(400).json({error: err.message});
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