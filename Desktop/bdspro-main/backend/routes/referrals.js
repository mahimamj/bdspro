const express = require('express');
const referralController = require('../controllers/referralController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's referral link
router.get('/link', referralController.getReferralLink);

// Get referral statistics
router.get('/stats', referralController.getReferralStats);

module.exports = router;
