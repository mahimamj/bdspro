const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Demo routes (no authentication required)
router.get('/demo/data', dashboardController.getDemoDashboardData);
router.get('/demo/cashback', dashboardController.getCashbackTransactions);
router.get('/demo/level1-income', dashboardController.getLevel1IncomeTransactions);
router.get('/demo/level2-income', dashboardController.getLevel2IncomeTransactions);
router.get('/demo/level1-business', dashboardController.getLevel1BusinessTransactions);
router.get('/demo/level2-business', dashboardController.getLevel2BusinessTransactions);
router.get('/demo/history', dashboardController.getTransactionHistory);

// All other dashboard routes require authentication
router.use(authenticateToken);

// Get dashboard data
router.get('/data', dashboardController.getDashboardData);

// Get user data for dashboard
router.get('/user-data', dashboardController.getUserData);

// Get referral list
router.get('/referrals', dashboardController.getReferralList);

// Get referral link
router.get('/referral-link', dashboardController.getReferralLink);

// Get withdrawal history
router.get('/withdrawals', dashboardController.getWithdrawalHistory);

// Get cashback transactions
router.get('/cashback', dashboardController.getCashbackTransactions);

// Get transaction history
router.get('/history', dashboardController.getTransactionHistory);

// Get Level 1 Income transactions
router.get('/level1-income', dashboardController.getLevel1IncomeTransactions);

// Get Level 2 Income transactions
router.get('/level2-income', dashboardController.getLevel2IncomeTransactions);

// Get Level 1 Business transactions
router.get('/level1-business', dashboardController.getLevel1BusinessTransactions);

// Get Level 2 Business transactions
router.get('/level2-business', dashboardController.getLevel2BusinessTransactions);

module.exports = router;
