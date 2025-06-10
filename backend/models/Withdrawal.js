const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // MongoDB ObjectId
  username: { type: String, required: true },  // Username for admin ease
  noOfTokens: { type: Number, required: true },
  value: { type: Number, required: true },
  requestedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'rejected', 'approved'], default: 'pending' },
  upiId: { type: String, required: true },
  utrNo: { type: String, default: '' },
  tid: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  value: { type: Number, required: true },  // Ensure the value field is added and required

});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
