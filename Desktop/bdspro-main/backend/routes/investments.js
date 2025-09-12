const express = require('express');
const investmentController = require('../controllers/investmentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create new investment
router.post('/', investmentController.createInvestment);

// Get user's investments
router.get('/', investmentController.getUserInvestments);

// Get user's earnings
router.get('/earnings', investmentController.getUserEarnings);

// Get investment statistics
router.get('/stats', investmentController.getInvestmentStats);

// Process matured investments (admin endpoint)
router.post('/process-matured', investmentController.processMaturedInvestments);

module.exports = router;
