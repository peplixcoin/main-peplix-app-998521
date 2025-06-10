const User = require('../models/User');
const Matrix = require('../models/Matrix');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const calculateCommission = require('../utils/commissionCalculator');
const Withdrawal = require('../models/Withdrawal');
const StatsData = require('../models/StatsData');
const PackageDetails = require('../models/PackageDetails');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const crypto = require('crypto');
const { updateTokensAvailable, calculateTokensAvailable } = require('./TransactionController');
const UsdRate = require('../models/UsdRate');
const nodemailer = require('nodemailer');

// Fetch USD Rate
exports.getUsdRate = async (req, res) => {
    try {
        const usdRate = await UsdRate.findOne();
        if (!usdRate) {
            return res.status(404).json({ message: 'USD rate not found' });
        }
        res.json({ rate: usdRate.rate });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch USD rate', error: error.message });
    }
};

// Helper function to distribute commissions after package purchase
const distributeCommissions = async (sponsorUsername, packageAmount) => {
    let sponsor = await User.findOne({ username: sponsorUsername });
    if (sponsor) {
        let relativeLevel = 0;

        while (sponsor && sponsor.level >= 0) {
            const commission = calculateCommission(relativeLevel, packageAmount);
            sponsor.wallet += parseFloat(commission.toFixed(2));
            sponsor.walletrecord += parseFloat(commission.toFixed(2));
            await sponsor.save();

            if (sponsor.level === 0 || !sponsor.sponsor) {
                break;
            }
            sponsor = await User.findOne({ username: sponsor.sponsor });
            relativeLevel++;
        }
    }
};

// User registration (with phoneNumber field)
exports.registerUser = async (req, res) => {
    const { username, email, password, phoneNumber, sponsorUsername } = req.body;

    try {
        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({ message: 'Username already in use. Please choose another.' });
        }

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Email already in use. Please use a different email.' });
        }

        const user = new User({
            username,
            email,
            password,
            phoneNumber,
            level: 0,
            wallet: 0,
            walletrecord: 0,
            totalAmountInvested: 0,
            tokenWallet: 0,
            packages: []
        });

        let sponsor = null;
        if (!sponsorUsername) {
            sponsor = await User.findOne({ level: 0 });
            if (!sponsor) {
                return res.status(500).json({ message: 'Grand Director not found' });
            }
        } else {
            sponsor = await User.findOne({ username: sponsorUsername });
            if (!sponsor) {
                return res.status(400).json({ message: 'Invalid sponsor username' });
            }

            if (sponsor.level >= 7) {
                return res.status(400).json({ message: 'Maximum tree limit reached. Please select another sponsor.' });
            }
        }

        user.level = sponsor.level + 1;
        user.sponsor = sponsor.username;

        sponsor.referrals.push(user.username);
        await sponsor.save();

        const userMatrix = new Matrix({ user: user._id, parent: sponsor._id, level: user.level });
        await userMatrix.save();

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Package purchase functionality
exports.buyPackage = async (req, res) => {
    const { packageId, packageAmount, packageName, stackingPeriod, min_tokens_req, amount } = req.body;

    try {
        // Validate required fields
        if (!packageId || !packageAmount || !packageName || !stackingPeriod || min_tokens_req == null || amount == null) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Fetch token value from StatsData
        const statsData = await StatsData.findOne();
        if (!statsData || !statsData.tokenValue || statsData.tokenValue <= 0) {
            return res.status(400).json({ message: 'Invalid or missing token value.' });
        }

        // Calculate tokens based on packageAmount / tokenValue, rounded down
        const tokenValue = statsData.tokenValue;
        const tokens = Math.floor(packageAmount / tokenValue);

        // Validate calculated tokens
        if (tokens <= 0) {
            return res.status(400).json({ message: 'Invalid token calculation.' });
        }

        const user = await User.findById(req.user);
        if (!user) return res.status(400).json({ message: 'User not found' });

        const packageDetails = await PackageDetails.findById(packageId);
        if (!packageDetails) return res.status(400).json({ message: 'Package not found' });

        const transaction = new Transaction({
            userId: user._id,
            username: user.username,
            packageId,
            packageName,
            packagePrice: packageAmount,
            tokens,
            tokensWithdrawn: 0,
            tokensAvailable: 0,
            min_tokens_req,
            amount,
            stackingPeriod,
            status: 'pending',
        });

        await transaction.save();

        res.status(200).json({ message: 'Package purchased successfully. The transaction is pending approval.', transactionId: transaction._id, tokens });
    } catch (error) {
        console.error('Error purchasing package:', error);
        res.status(500).json({ message: 'Server error during package purchase.' });
    }
};

// Submit UTR functionality
exports.submitUTR = async (req, res) => {
    const { packageId, packageAmount, packageName, stackingPeriod, utr, min_tokens_req, amountInINR } = req.body;

    try {
        // Validate required fields
        if (!packageId || !packageAmount || !packageName || !stackingPeriod || !utr || min_tokens_req == null || amountInINR == null) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Fetch token value from StatsData
        const statsData = await StatsData.findOne();
        if (!statsData || !statsData.tokenValue || statsData.tokenValue <= 0) {
            return res.status(400).json({ message: 'Invalid or missing token value.' });
        }

        // Calculate tokens based on packageAmount / tokenValue, rounded down
        const tokenValue = statsData.tokenValue;
        const tokens = Math.floor(packageAmount / tokenValue);

        // Validate calculated tokens
        if (tokens <= 0) {
            return res.status(400).json({ message: 'Invalid token calculation.' });
        }

        const user = await User.findById(req.user);
        if (!user) return res.status(400).json({ message: 'User not found' });

        const packageDetails = await PackageDetails.findById(packageId);
        if (!packageDetails) return res.status(400).json({ message: 'Package not found' });

        if (utr.length !== 64) {
            return res.status(400).json({ message: 'Transaction ID must be exactly 64 characters long.' });
        }

        const existingTransaction = await Transaction.findOne({ utr });
        if (existingTransaction) {
            return res.status(400).json({ message: 'UTR has already been submitted. Please use a unique UTR.' });
        }

        const transaction = new Transaction({
            userId: user._id,
            username: user.username,
            packageId,
            packageName,
            packagePrice: packageAmount,
            tokens,
            min_tokens_req,
            stackingPeriod,
            utr,
            amount: amountInINR,
            status: 'pending',
        });

        await transaction.save();

        res.status(200).json({ message: 'UTR submitted. Transaction is pending approval.', transactionId: transaction._id, tokens });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting UTR.', error: error.message });
    }
};

// Fetch all available packages
exports.getPackages = async (req, res) => {
    try {
        const packages = await PackageDetails.find();
        const formattedPackages = packages.map(pkg => {
            const features = [];
            if (pkg.feature1) features.push(pkg.feature1);
            if (pkg.feature2) features.push(pkg.feature2);
            if (pkg.feature3) features.push(pkg.feature3);
            if (pkg.feature4) features.push(pkg.feature4);
            return {
                ...pkg._doc,
                features
            };
        });
        res.status(200).json(formattedPackages);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch packages' });
    }
};

// Fetch package by ID
exports.getPackageById = async (req, res) => {
    const { packageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(packageId)) {
        return res.status(400).json({ message: 'Invalid package ID' });
    }

    try {
        const packageDetails = await PackageDetails.findById(packageId);
        if (!packageDetails) {
            return res.status(404).json({ message: 'Package not found' });
        }

        const features = [];
        if (packageDetails.feature1) features.push(packageDetails.feature1);
        if (packageDetails.feature2) features.push(packageDetails.feature2);
        if (packageDetails.feature3) features.push(packageDetails.feature3);
        if (packageDetails.feature4) features.push(packageDetails.feature4);

        const response = {
            ...packageDetails._doc,
            features
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching package details:', error);
        res.status(500).json({ message: 'Error fetching package details', error: error.message });
    }
};

// Login functionality
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fetch user profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fetch team members (users whose sponsor is the current logged-in user)
exports.getTeamMembers = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const teamMembers = await User.find({ sponsor: currentUser.username }).select('username email phoneNumber rank');

        res.status(200).json(teamMembers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team members', error: error.message });
    }
};

// Fetch all transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user }).select('packageName tokensWithdrawn tokensAvailable stackingPeriod dateandtime status tokens packagePrice min_tokens_req');
        const updatedTransactions = await Promise.all(transactions.map(async (transaction) => {
            // Update tokensAvailable in the database
            await updateTokensAvailable(transaction._id);
            // Fetch the updated transaction
            const updatedTransaction = await Transaction.findById(transaction._id);
            return {
                ...updatedTransaction._doc,
                tokensAvailable: updatedTransaction.tokensAvailable
            };
        }));
        res.status(200).json(updatedTransactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
};


// Configure nodemailer with Google OAuth2
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    accessToken: process.env.GOOGLE_ACCESS_TOKEN,
  },
});

// Generate random 10-digit alphanumeric password
function generateRandomPassword() {
  return crypto.randomBytes(5).toString('hex').substring(0, 10);
}

exports.forgotPassword = async (req, res) => {
  const { username, email } = req.body;

  try {
    // Find user by username and email
    const user = await User.findOne({ 
      username, 
      email 
    });

    if (!user) {
      return res.status(404).json({ 
        message: 'No user found with the provided credentials' 
      });
    }
    // Generate new password and hash it
    const newPassword = generateRandomPassword();
    const hashedPassword = newPassword

    // Update user's password in database
    user.password = hashedPassword;
    await user.save();

    // Send email with new password
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your New Password for OI App',
      text: `Hi ${user.username}!\n\nYour new password is: ${newPassword}\n\nPlease use this password for Login.`,
      html: `
        <div>
          <h2>Password Reset</h2>
          <p>Hi <strong>${user.username}</strong>!</p>
          <p>Your new password is: <strong>${newPassword}</strong></p>
          <p>Please use this password for Login.</p>
          <p>Please save this password or save this email for future Login.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: 'New password has been sent to your email' 
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ 
      message: 'Error processing password reset' 
    });
  }
};