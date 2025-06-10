const Withdrawal = require('../models/Withdrawal');
const StatsData = require('../models/StatsData');
const User = require('../models/User');
const Transaction = require('../models/Transaction');


// Withdraw tokens logic
exports.withdrawAmount = async (req, res) => {
  const { noOfTokens, upiId, transactionId } = req.body;

  try {
    const user = await User.findById(req.user).select('username email phoneNumber');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.status !== 'approved') {
      return res.status(404).json({ message: 'Transaction not found or not approved' });
    }

    // Get the token value from StatsData
    const statsData = await StatsData.findOne();
    const tokenValue = statsData.tokenValue;

    // Calculate the value based on number of tokens and token value
    const value = noOfTokens * tokenValue;

    if (!value) {
      return res.status(400).json({ message: 'Unable to calculate withdrawal value.' });
    }

    // Create a new withdrawal request with a "pending" status
    const newWithdrawal = new Withdrawal({
      userId: user._id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      noOfTokens,
      upiId,
      value,  // Add the calculated value
      status: 'pending',  // Mark the withdrawal as pending
      tid: transactionId
    });

    await newWithdrawal.save();
    res.status(200).json({ message: 'Withdrawal request submitted successfully and is pending approval' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};








exports.getWithdrawals = async (req, res) => {
  try {
    // Fetch withdrawals using the user ID
    const withdrawals = await Withdrawal.find({ userId: req.user }).sort({ requestedAt: -1 });


    res.status(200).json(withdrawals);
  } catch (error) {
   
    res.status(500).json({ message: 'Failed to fetch withdrawals' });
  }
};



