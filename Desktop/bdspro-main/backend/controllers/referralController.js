/**
 * Referral Controller
 * Handles all referral-related API endpoints using the new SQL views
 */

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.RAILWAY_MYSQL_HOST || process.env.MYSQL_HOST || 'localhost',
  port: process.env.RAILWAY_MYSQL_PORT || process.env.MYSQL_PORT || 3306,
  user: process.env.RAILWAY_MYSQL_USER || process.env.MYSQL_USER || 'root',
  password: process.env.RAILWAY_MYSQL_PASSWORD || process.env.MYSQL_PASSWORD || '',
  database: process.env.RAILWAY_MYSQL_DATABASE || process.env.MYSQL_DATABASE || 'bdspro',
  ssl: process.env.RAILWAY_MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// Create connection pool for better performance
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Get all referrals for a specific user (Level 1 & 2)
 */
const getUserReferrals = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM user_referrals WHERE referrer = ? ORDER BY level, referral_joined_date DESC',
      [userId]
    );

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });

  } catch (error) {
    console.error('Error getting user referrals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user referrals',
      error: error.message
    });
  }
};

/**
 * Get referral statistics for a specific user
 */
const getUserReferralStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM referral_stats WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error('Error getting user referral stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user referral stats',
      error: error.message
    });
  }
};

/**
 * Get referral earnings for a specific user
 */
const getUserReferralEarnings = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM referral_earnings WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });

  } catch (error) {
    console.error('Error getting user referral earnings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user referral earnings',
      error: error.message
    });
  }
};

/**
 * Get complete referral dashboard for a user
 */
const getReferralDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    // Get referral statistics
    const [statsRows] = await pool.execute(
      'SELECT * FROM referral_stats WHERE user_id = ?',
      [userId]
    );

    // Get referral earnings
    const [earningsRows] = await pool.execute(
      'SELECT * FROM referral_earnings WHERE user_id = ?',
      [userId]
    );

    // Get recent referrals
    const [referralsRows] = await pool.execute(
      'SELECT * FROM user_referrals WHERE referrer = ? ORDER BY referral_joined_date DESC LIMIT 10',
      [userId]
    );

    if (statsRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        stats: statsRows[0],
        earnings: earningsRows[0] || {
          level1_earnings: 0,
          level2_earnings: 0,
          total_referral_earnings: 0,
          level1_business: 0,
          level2_business: 0,
          total_business_volume: 0
        },
        recent_referrals: referralsRows
      }
    });

  } catch (error) {
    console.error('Error getting referral dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral dashboard',
      error: error.message
    });
  }
};

/**
 * Get all referral statistics (admin only)
 */
const getAllReferralStats = async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = 'total_referrals', sortOrder = 'DESC' } = req.query;
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(
      `SELECT * FROM referral_stats 
       ORDER BY ${sortBy} ${sortOrder.toUpperCase()} 
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [countRows] = await pool.execute('SELECT COUNT(*) as total FROM referral_stats');
    const total = countRows[0].total;

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting all referral stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral stats',
      error: error.message
    });
  }
};

/**
 * Get top referrers
 */
const getTopReferrers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [rows] = await pool.execute(
      `SELECT 
        referrer, 
        referrer_name, 
        COUNT(*) as total_referrals,
        SUM(CASE WHEN level = 1 THEN 1 ELSE 0 END) as level1_count,
        SUM(CASE WHEN level = 2 THEN 1 ELSE 0 END) as level2_count
       FROM user_referrals 
       GROUP BY referrer, referrer_name 
       ORDER BY total_referrals DESC 
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error getting top referrers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top referrers',
      error: error.message
    });
  }
};

/**
 * Get referral chain (who referred whom)
 */
const getReferralChain = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    const [rows] = await pool.execute(
      `SELECT 
        u1.user_id as referrer_id,
        u1.name as referrer_name,
        u2.user_id as level1_referral_id,
        u2.name as level1_referral_name,
        u3.user_id as level2_referral_id,
        u3.name as level2_referral_name
       FROM users u1
       LEFT JOIN users u2 ON u2.referrer_id = u1.user_id
       LEFT JOIN users u3 ON u3.referrer_id = u2.user_id
       WHERE u1.user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error getting referral chain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral chain',
      error: error.message
    });
  }
};

module.exports = {
  getUserReferrals,
  getUserReferralStats,
  getUserReferralEarnings,
  getReferralDashboard,
  getAllReferralStats,
  getTopReferrers,
  getReferralChain
};