const StatsData = require('../models/StatsData');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fetch stats data
 // Import the StatsData model

// Fetch stats data
exports.getStatsData = async (req, res) => {
    try {
        const stats = await StatsData.findOne(); // Fetch a single document from StatsData collection
        if (!stats) {
            return res.status(404).json({ message: 'Stats not found' });
        }
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Update stats data (for admin or data entry purposes)
exports.updateStatsData = async (req, res) => {
    const { tokenValue, totalInvestment, profitPercent, activeUsers, tokenDescription, investmentDescription, profitDescription, usersDescription } = req.body;
    
    try {
        let stats = await StatsData.findOne();
        if (!stats) {
            stats = new StatsData({ tokenValue, totalInvestment, profitPercent, activeUsers, tokenDescription, investmentDescription, profitDescription, usersDescription });
        } else {
            stats.tokenValue = tokenValue || stats.tokenValue;
            stats.totalInvestment = totalInvestment || stats.totalInvestment;
            stats.profitPercent = profitPercent || stats.profitPercent;
            stats.activeUsers = activeUsers || stats.activeUsers;
            stats.tokenDescription = tokenDescription || stats.tokenDescription;
            stats.investmentDescription = investmentDescription || stats.investmentDescription;
            stats.profitDescription = profitDescription || stats.profitDescription;
            stats.usersDescription = usersDescription || stats.usersDescription;
        }
        await stats.save();
        res.status(200).json({ message: 'Stats updated successfully', stats });
    } catch (error) {
        res.status(500).json({ message: 'Error updating stats', error: error.message });
    }
};
