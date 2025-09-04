const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/deposit-addresses', paymentController.getDepositAddresses);

// Protected routes (authentication required)
router.use(authenticateToken);

// Create deposit record
router.post('/deposits', paymentController.createDeposit);

// Get user's deposit history
router.get('/deposits', paymentController.getDepositHistory);

// Update deposit status (admin only - you might want to add admin middleware)
router.put('/deposits/:depositId/status', paymentController.updateDepositStatus);

module.exports = router;