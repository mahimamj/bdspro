const express = require('express');
const { body } = require('express-validator');
const transactionController = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public endpoint for dashboard card demo (no auth required)
router.get('/by-category', transactionController.getTransactionsByCategory);

// All other transaction routes require authentication
router.use(authenticateToken);

// Validation rules
const depositValidation = [
    body('amount').isFloat({ min: 50 }).withMessage('Minimum deposit amount is 50 USDT'),
    body('method').isIn(['usdt', 'bank', 'upi']).withMessage('Please select a valid payment method'),
    body('note').optional().trim().isLength({ max: 255 }).withMessage('Note must be less than 255 characters')
];

const withdrawalValidation = [
    body('amount').isFloat({ min: 10 }).withMessage('Minimum withdrawal amount is 10 USDT'),
    body('address').isLength({ min: 10 }).withMessage('Please enter a valid USDT address'),
    body('note').optional().trim().isLength({ max: 255 }).withMessage('Note must be less than 255 characters')
];

// Create deposit request
router.post('/deposit', depositValidation, transactionController.createDeposit);

// Create withdrawal request
router.post('/withdrawal', withdrawalValidation, transactionController.createWithdrawal);

// Get transaction history
router.get('/history', transactionController.getTransactionHistory);

module.exports = router;
