const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  packageName: { type: String, required: true },
  packagePrice: { type: Number, required: true },
  amount: { type: Number, required: true },
  tokens: { type: Number, required: true },
  tokensWithdrawn: { type: Number, required: false, default: 0 },
  tokensAvailable: { type: Number, required: false, default: 0 },
  min_tokens_req: { type: Number, required: false },
  stackingPeriod: { type: Number, required: true },
  utr: { type: String, unique: true, sparse: true }, // Ensure uniqueness
  dateandtime: { type: Date, default: Date.now }, // Date of transaction
  lastUpdated: { type: Date, default: Date.now }, // Date when tokensAvailable was last updated
  status: { type: String, enum: ['pending', 'rejected', 'approved'], default: 'pending' }
});

const Transaction = mongoose.model('Transaction', transactionSchema);


module.exports = Transaction;
