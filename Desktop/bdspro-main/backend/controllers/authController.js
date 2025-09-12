const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Simple admin authentication
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check credentials against environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: 'admin',
        username: adminUsername,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here_development_only',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          username: adminUsername,
          role: 'admin'
        }
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Verify admin token
const verifyAdmin = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        admin: req.admin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

module.exports = {
  adminLogin,
  verifyAdmin
};