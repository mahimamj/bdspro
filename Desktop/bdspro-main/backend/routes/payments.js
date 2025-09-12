const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createPayment, getAllPayments, updatePaymentStatus, getPaymentById, upload } = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Validation rules
const paymentValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('amount')
    .isFloat({ min: 50 })
    .withMessage('Amount must be at least 50 USDT'),
  body('network')
    .isIn(['TRC20', 'BEP20'])
    .withMessage('Network must be either TRC20 or BEP20')
];

// POST /api/payments - Create new payment
router.post('/', upload.single('screenshot'), paymentValidation, createPayment);

// GET /api/payments - Get all payments (admin only)
router.get('/', auth, getAllPayments);

// GET /api/payments/:id - Get payment by ID
router.get('/:id', getPaymentById);

// PUT /api/payments/:id/status - Update payment status (admin only)
router.put('/:id/status', auth, updatePaymentStatus);

module.exports = router;