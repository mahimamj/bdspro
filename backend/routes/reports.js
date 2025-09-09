const express = require('express');
const router = express.Router();
const { getUserReport, getSystemStats, getTransactionReport } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/reports/user/:userId - Get comprehensive user report
router.get('/user/:userId', authenticateToken, getUserReport);

// GET /api/reports/system - Get system-wide statistics
router.get('/system', authenticateToken, getSystemStats);

// GET /api/reports/transactions - Get detailed transaction report
router.get('/transactions', authenticateToken, getTransactionReport);

module.exports = router;
