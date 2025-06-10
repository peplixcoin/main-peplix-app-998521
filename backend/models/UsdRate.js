// models/UsdRate.js
const mongoose = require('mongoose');

const usdRateSchema = new mongoose.Schema({
  rate: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('UsdRate', usdRateSchema);