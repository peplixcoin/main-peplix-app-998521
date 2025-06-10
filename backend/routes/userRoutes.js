const express = require('express');
const { registerUser, loginUser, getUserProfile, buyPackage, submitUTR, getPackages, getTeamMembers, forgotPassword, resetPassword, getPackageById, getAllTransactions, getUsdRate} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const { getStatsData, updateStatsData } = require('../controllers/statsController');
const { withdrawAmount, getWithdrawals } = require('../controllers/withdrawController');
const { withdrawWalletAmount, getWalletWithdraws } = require('../controllers/walletWithdrawController');
const { getNotifications, addNotification } = require('../controllers/notificationController');
const Terms = require('../models/Terms');
const { getQRCode } = require('../controllers/imageController');



router.get('/qr-code', getQRCode); // Route to fetch QR code

router.get('/usd-rate', getUsdRate);  // Add this line to handle USD rate fetching

router.post('/forgot-password', forgotPassword);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddleware, getUserProfile);

router.get('/packages/:packageId', getPackageById);

router.post('/buy-package', authMiddleware, buyPackage); // Buy package route

// Add the new route for withdrawal functionality
router.post('/withdraw', authMiddleware, withdrawAmount); // Withdrawal route
router.get('/withdrawals-history', authMiddleware, getWithdrawals); // Route to get withdrawal history

router.post('/submit-utr', authMiddleware, submitUTR);

router.get('/packages', getPackages);
// New route to fetch team members
router.get('/team', authMiddleware, getTeamMembers);

// Route for fetching stats data
router.get('/stats', authMiddleware, getStatsData);

// Route for updating stats data (only for admin)
router.post('/stats/update', authMiddleware, updateStatsData);

router.get('/transactions', authMiddleware, getAllTransactions);

// Route to handle wallet withdrawal request
router.post('/withdraw-wallet', authMiddleware, withdrawWalletAmount);

// Route to fetch the wallet withdrawal history
router.get('/withdrawal-history', authMiddleware, getWalletWithdraws);

// Route to fetch notifications
router.get('/getnotifications', getNotifications);

// Optional: Route to add notifications (if needed)
router.post('/addnotification', addNotification);



// Route to fetch terms and conditions
router.get('/terms', async (req, res) => {
  try {
      const terms = await Terms.find();
      res.status(200).json(terms);
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch terms' });
  }
});


module.exports = router;

