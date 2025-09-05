const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { createUser, findUserByEmail } = require('./database');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  console.log('Register function called with:', {
    method: event.httpMethod,
    body: event.body,
    headers: event.headers
  });

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Request body is required'
        })
      };
    }

    const { name, email, password, confirmPassword } = JSON.parse(event.body);

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'All fields are required'
        })
      };
    }

    if (password !== confirmPassword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Passwords do not match'
        })
      };
    }

    if (password.length < 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Password must be at least 6 characters long'
        })
      };
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'User with this email already exists'
        })
      };
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate unique user ID
    const userId = uuidv4();
    
    // Create user
    const newUser = {
      user_id: userId,
      name,
      email,
      password_hash: hashedPassword,
      account_balance: 0,
      total_earning: 0,
      rewards: 0,
      is_verified: false,
      created_at: new Date().toISOString()
    };

    createUser(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { user_id: userId, email: email },
      process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development',
      { expiresIn: '24h' }
    );

    const userData = {
      user_id: newUser.user_id,
      name: newUser.name,
      email: newUser.email,
      account_balance: newUser.account_balance,
      total_earning: newUser.total_earning,
      rewards: newUser.rewards,
      is_verified: newUser.is_verified
    };

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userData,
          token: token
        }
      })
    };

  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error'
      })
    };
  }
};
