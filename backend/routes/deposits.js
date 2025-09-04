const express = require('express');
const router = express.Router();
const { processDeposit, getUserBalance, getUserNetwork } = require('../controllers/depositController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/deposits/deposit - Process user deposit
router.post('/deposit', authenticateToken, processDeposit);

// GET /api/deposits/balance/:userId - Get user balance and earnings
router.get('/balance/:userId', authenticateToken, getUserBalance);

// GET /api/deposits/network/:userId - Get user network stats
router.get('/network/:userId', authenticateToken, getUserNetwork);

module.exports = router;
