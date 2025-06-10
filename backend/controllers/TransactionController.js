const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { distributeCommissions } = require('../utils/commissionCalculator');

const calculateTokensAvailable = async (transaction) => {
    if (!transaction || transaction.status !== 'approved') {
        return 0;
    }

    const purchaseDate = new Date(transaction.dateandtime);
    const currentDate = new Date();
    const endDate = new Date(purchaseDate);
    endDate.setDate(purchaseDate.getDate() + transaction.stackingPeriod);

    // If current date is past the stacking period, all remaining tokens are available
    if (currentDate > endDate) {
        return parseFloat((transaction.tokens - transaction.tokensWithdrawn).toFixed(2));
    }

    // Calculate days since purchase
    const daysSincePurchase = Math.floor((currentDate - purchaseDate) / (1000 * 60 * 60 * 24));
    const tokensPerDay = transaction.tokens / transaction.stackingPeriod;
    const calculatedTokens = Math.min(tokensPerDay * daysSincePurchase, transaction.tokens);

    // Subtract tokensWithdrawn from calculated tokens
    const tokensAvailable = Math.max(calculatedTokens - transaction.tokensWithdrawn, 0);

    return parseFloat(tokensAvailable.toFixed(2));
};

const updateTokensAvailable = async (transactionId) => {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction || transaction.status !== 'approved') {
        return;
    }

    // Calculate tokens available considering tokensWithdrawn
    const tokensAvailable = await calculateTokensAvailable(transaction);

    // Update tokensAvailable and lastUpdated in the database
    transaction.tokensAvailable = tokensAvailable;
    transaction.lastUpdated = new Date();

    await transaction.save();
};

module.exports = { updateTokensAvailable, calculateTokensAvailable };