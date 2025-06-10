const WalletWithdraw = require('../models/WalletWithdraw');
const User = require('../models/User');

// Function to handle wallet withdrawal request
exports.withdrawWalletAmount = async (req, res) => {
    const { withdrawAmount, upiId } = req.body;

    try {
        const user = await User.findById(req.user._id); // Assuming user ID is in req.user from middleware

        // Check if the user has at least one package
        if (!user.packages || user.packages.length === 0) {
            return res.status(400).json({ message: 'You must own at least one package to withdraw funds.' });
        }

        // Ensure the withdrawal amount is at least $15
        if (withdrawAmount < 1) {
            return res.status(400).json({ message: 'The minimum withdrawal amount is $15.' });
        }

        // Check if the user has enough balance
        if (user.wallet < withdrawAmount) {
            return res.status(400).json({ message: 'Insufficient wallet balance.' });
        }

        // Create a new withdrawal entry with pending status
        const newWithdraw = new WalletWithdraw({
            userId: user._id,
            username: user.username,
            withdrawAmount,
            upiId,
            status: 'pending'
        });

        // Save the withdrawal request
        await newWithdraw.save();

        return res.status(200).json({ message: 'Withdrawal request submitted successfully.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to process withdrawal request.' });
    }
};



// Function to get the withdrawal history for a user
exports.getWalletWithdraws = async (req, res) => {
    try {
        // Fetch the withdrawals by the user
        const withdrawals = await WalletWithdraw.find({ userId: req.user._id }).sort({ requestedAt: -1 });

        return res.status(200).json(withdrawals);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to fetch withdrawal history.' });
    }
};
