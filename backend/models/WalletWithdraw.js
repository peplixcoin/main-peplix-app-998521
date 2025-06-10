const mongoose = require('mongoose');

const WalletWithdrawSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    username: { 
        type: String, 
        required: true 
    },
    withdrawAmount: { 
        type: Number, 
        required: true 
    },
    requestedAt: { 
        type: Date, 
        default: Date.now 
    },
    status: { 
        type: String, 
        enum: ['pending', 'rejected', 'approved'], 
        default: 'pending' 
    },
    upiId: { 
        type: String, 
        required: true 
    },
    utrNo: { 
        type: String, 
        default: null 
    }
});

const WalletWithdraw = mongoose.model('WalletWithdraw', WalletWithdrawSchema);

module.exports = WalletWithdraw;
