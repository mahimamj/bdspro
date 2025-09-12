/**
 * Referral Routes
 * API endpoints for referral management using SQL views
 */

const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const auth = require('../middleware/auth');

// Public routes (require authentication)
router.get('/user/:userId', auth, referralController.getUserReferrals);
router.get('/stats/:userId', auth, referralController.getUserReferralStats);
router.get('/earnings/:userId', auth, referralController.getUserReferralEarnings);
router.get('/dashboard/:userId', auth, referralController.getReferralDashboard);
router.get('/chain/:userId', auth, referralController.getReferralChain);

// Admin routes (require admin authentication)
router.get('/admin/stats', auth, referralController.getAllReferralStats);
router.get('/admin/top-referrers', auth, referralController.getTopReferrers);

module.exports = router;