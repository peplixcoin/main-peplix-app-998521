const mongoose = require('mongoose');

const statsDataSchema = new mongoose.Schema({
    tokenValue: { type: Number, required: true },
    totalInvestment: { type: Number, required: true },
    profitPercent: { type: Number, required: true },
    activeUsers: { type: Number, required: true },
    tokenDescription: { type: String, default: "" },
    investmentDescription: { type: String, default: "" },
    profitDescription: { type: String, default: "" },
    usersDescription: { type: String, default: "" }
});

module.exports = mongoose.model('StatsData', statsDataSchema);
