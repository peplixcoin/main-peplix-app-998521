const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },  // Added phone number
    sponsor: { type: String },  // Sponsor's username
    referrals: [{ type: String }],  // Referrals by username
    level: { type: Number, default: 0 },
    walletrecord: {type: Number, default: 0},
    wallet: { type: Number, default: 0 },  // Wallet to hold commission
    totalAmountInvested: { type: Number, default: 0 },  // Track total amount invested
    tokenWallet: { type: Number, default: 0 },
    packages: [{ type: Number }],  // Array to store all purchased packages
    // Add the fields for password reset functionality
    rank: { type: String, default: 'Member' },
    resetPasswordToken: { type: String },  // Token for password reset
    resetPasswordExpire: { type: Date },  // Expiry time for the reset token
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', userSchema);
