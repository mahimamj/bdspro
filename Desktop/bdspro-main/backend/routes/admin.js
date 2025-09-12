const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { adminLogin, verifyAdmin } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Validation rules for admin login
const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// POST /api/admin/login - Admin login
router.post('/login', loginValidation, adminLogin);

// GET /api/admin/verify - Verify admin token
router.get('/verify', auth, verifyAdmin);

module.exports = router;
