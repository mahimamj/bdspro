const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { 
  getUserByEmail, 
  createUser, 
  getUserById,
  updateUserVerification 
} = require('../helpers/databaseHelpers');
const { generateReferralCode } = require('./referralController');

// Register new user with email and password
const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, referralCode } = req.body;

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate unique user ID
    const userId = uuidv4();
    
    // Generate referral code for new user
    const userReferralCode = generateReferralCode();
    
    // Find referrer if referral code provided
    let referrerId = null;
    if (referralCode) {
      const [referrer] = await db.pool.execute(
        'SELECT user_id FROM users WHERE referral_code = ?',
        [referralCode]
      );
      if (referrer.length > 0) {
        referrerId = referrer[0].user_id;
      }
    }

    // Create user
    console.log('Creating user with name:', name);
    const createResult = await createUser(userId, name, email, hashedPassword, userReferralCode, referrerId);
    console.log('User created successfully, result:', createResult);
    
    // Get the auto-generated user ID from the database
    const actualUserId = createResult.insertId;
    console.log('Auto-generated user ID:', actualUserId);

    // Generate JWT token
    const token = jwt.sign(
      { user_id: actualUserId, email: email },
      process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development',
      { expiresIn: '24h' }
    );

    // Get user data (without password)
    console.log('Fetching user data for ID:', actualUserId);
    const user = await getUserById(actualUserId);
    console.log('User data retrieved:', user);
    
    if (!user) {
      console.error('User not found after creation. UserId:', actualUserId);
      return res.status(500).json({
        success: false,
        message: 'User creation failed - user not found after creation'
      });
    }
    
    const userData = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      account_balance: parseFloat(user.account_balance),
      total_earning: parseFloat(user.total_earning),
      rewards: parseFloat(user.rewards),
      is_verified: user.is_verified
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userData,
        token: token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Login user with email and password
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development',
      { expiresIn: '24h' }
    );

    // Prepare user data (without password)
    const userData = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      account_balance: parseFloat(user.account_balance),
      total_earning: parseFloat(user.total_earning),
      rewards: parseFloat(user.rewards),
      is_verified: user.is_verified
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token: token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      account_balance: parseFloat(user.account_balance),
      total_earning: parseFloat(user.total_earning),
      rewards: parseFloat(user.rewards),
      is_verified: user.is_verified,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    res.json({
      success: true,
      data: {
        user: userData
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Check if email is already taken by another user
    const existingUser = await getUserByEmail(email);
    if (existingUser && existingUser.user_id !== userId) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken by another user'
      });
    }

    // Update user profile
    const query = 'UPDATE users SET name = ?, email = ?, updated_at = NOW() WHERE user_id = ?';
    const { executeQuery } = require('../helpers/databaseHelpers');
    await executeQuery(query, [name, email, userId]);

    // Get updated user data
    const user = await getUserById(userId);
    const userData = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      account_balance: parseFloat(user.account_balance),
      total_earning: parseFloat(user.total_earning),
      rewards: parseFloat(user.rewards),
      is_verified: user.is_verified,
      updated_at: user.updated_at
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userData
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get current user
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const { updateUserPassword } = require('../helpers/databaseHelpers');
    await updateUserPassword(userId, hashedNewPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Google OAuth callback (existing functionality)
const googleCallback = async (req, res) => {
  try {
    if (req.user) {
      const user = req.user;
      
      // Check if user exists in database
      let existingUser = await getUserByEmail(user.email);
      
      if (!existingUser) {
        // Create new user for Google OAuth
        const userId = uuidv4();
        const tempPassword = uuidv4(); // Temporary password for OAuth users
        const hashedPassword = await bcrypt.hash(tempPassword, 12);
        
        await createUser(userId, user.name, user.email, hashedPassword);
        existingUser = await getUserById(userId);
      }

      // Generate JWT token
      const token = jwt.sign(
        { user_id: existingUser.user_id, email: existingUser.email },
        process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development',
        { expiresIn: '24h' }
      );

      const userData = {
        user_id: existingUser.user_id,
        name: existingUser.name,
        email: existingUser.email,
        account_balance: parseFloat(existingUser.account_balance),
        total_earning: parseFloat(existingUser.total_earning),
        rewards: parseFloat(existingUser.rewards),
        is_verified: true // Google OAuth users are considered verified
      };

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/dashboard?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  googleCallback
};