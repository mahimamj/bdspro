const jwt = require('jsonwebtoken');
const { findUserById } = require('./database');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Get token from Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Access token required'
        })
      };
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development');
    
    // Find user
    const user = findUserById(decoded.user_id);
    if (!user) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'User not found'
        })
      };
    }

    // Return dashboard data
    const dashboardData = {
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        account_balance: user.account_balance,
        total_earning: user.total_earning,
        rewards: user.rewards,
        is_verified: user.is_verified
      },
      stats: {
        total_users: 1, // This would come from database in real app
        total_earnings: user.total_earning,
        active_referrals: 0
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: dashboardData
      })
    };

  } catch (error) {
    console.error('Dashboard error:', error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Invalid token'
      })
    };
  }
};
