const db = require('../config/database');
const { getUserById } = require('../helpers/databaseHelpers');

// Get comprehensive dashboard data with all metrics
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    // Get user basic info
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 1. Account Balance (from transactions)
    const [balanceResult] = await db.pool.execute(`
      SELECT COALESCE(SUM(
        CASE 
          WHEN type = 'deposit' OR type = 'level1_income' OR type = 'level2_income' OR type = 'growth' THEN amount
          WHEN type = 'withdrawal' THEN -amount
          ELSE 0 
        END
      ), 0) as account_balance
      FROM transactions 
      WHERE user_id = ? AND status = 'completed'
    `, [userId]);

    // 2. Level 1 Income (direct referrals)
    const [level1IncomeResult] = await db.pool.execute(`
      SELECT COALESCE(SUM(amount), 0) as level1_income
      FROM earnings 
      WHERE user_id = ? AND type = 'referral_level_1'
    `, [userId]);

    // 3. Level 2 Income (indirect referrals)
    const [level2IncomeResult] = await db.pool.execute(`
      SELECT COALESCE(SUM(amount), 0) as level2_income
      FROM earnings 
      WHERE user_id = ? AND type = 'referral_level_2'
    `, [userId]);

    // 4. Rewards
    const [rewardsResult] = await db.pool.execute(`
      SELECT COALESCE(SUM(amount), 0) as rewards
      FROM earnings 
      WHERE user_id = ? AND type = 'rewards'
    `, [userId]);

    // 5. Total Earnings (Level 1 + Level 2 + Rewards)
    const [totalEarningsResult] = await db.pool.execute(`
      SELECT COALESCE(SUM(amount), 0) as total_earnings
      FROM earnings 
      WHERE user_id = ? AND type IN ('referral_level_1', 'referral_level_2', 'rewards')
    `, [userId]);

    // 6. Level 1 Business (transaction volume from direct referrals)
    const [level1BusinessResult] = await db.pool.execute(`
      SELECT COALESCE(SUM(bt.amount), 0) as level1_business
      FROM business_tracking bt
      WHERE bt.user_id = ? AND bt.level = 'level_1'
    `, [userId]);

    // 7. Level 2 Business (transaction volume from indirect referrals)
    const [level2BusinessResult] = await db.pool.execute(`
      SELECT COALESCE(SUM(bt.amount), 0) as level2_business
      FROM business_tracking bt
      WHERE bt.user_id = ? AND bt.level = 'level_2'
    `, [userId]);

    // 8. Get referral statistics
    const [referralStats] = await db.pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE referrer_id = ?) as level1_count,
        (SELECT COUNT(*) FROM users u1 
         JOIN users u2 ON u1.user_id = u2.referrer_id 
         WHERE u1.referrer_id = ?) as level2_count
    `, [userId, userId]);

    // 9. Get recent transactions
    const [recentTransactions] = await db.pool.execute(`
      SELECT type, amount, description, timestamp, status
                 FROM transactions 
                 WHERE user_id = ? 
                 ORDER BY timestamp DESC 
      LIMIT 10
    `, [userId]);

    // 10. Get recent earnings
    const [recentEarnings] = await db.pool.execute(`
      SELECT e.type, e.amount, e.description, e.created_at, u.name as source_name
      FROM earnings e
      LEFT JOIN users u ON e.source_user_id = u.user_id
      WHERE e.user_id = ? 
      ORDER BY e.created_at DESC 
      LIMIT 10
    `, [userId]);

    const dashboardData = {
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        referral_code: user.referral_code
      },
      metrics: {
        account_balance: parseFloat(balanceResult[0].account_balance),
        total_earnings: parseFloat(totalEarningsResult[0].total_earnings),
        level1_income: parseFloat(level1IncomeResult[0].level1_income),
        level2_income: parseFloat(level2IncomeResult[0].level2_income),
        rewards: parseFloat(rewardsResult[0].rewards),
        level1_business: parseFloat(level1BusinessResult[0].level1_business),
        level2_business: parseFloat(level2BusinessResult[0].level2_business)
      },
      referral_stats: {
        level1_count: referralStats[0].level1_count,
        level2_count: referralStats[0].level2_count,
        total_referrals: referralStats[0].level1_count + referralStats[0].level2_count
      },
      recent_transactions: recentTransactions,
      recent_earnings: recentEarnings
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user data (simplified version for compatibility)
const getUserData = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const [userResult] = await db.pool.execute(`
      SELECT user_id, name, email, account_balance, total_earning, rewards, referral_code
      FROM users 
      WHERE user_id = ?
    `, [userId]);

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult[0];

    // Get additional metrics
    const [level1Income] = await db.pool.execute(`
      SELECT COALESCE(SUM(amount), 0) as level1_income
      FROM earnings 
      WHERE user_id = ? AND type = 'referral_level_1'
    `, [userId]);

    const [level2Income] = await db.pool.execute(`
      SELECT COALESCE(SUM(amount), 0) as level2_income
      FROM earnings 
      WHERE user_id = ? AND type = 'referral_level_2'
    `, [userId]);

    const [level1Business] = await db.pool.execute(`
      SELECT COALESCE(SUM(amount), 0) as level1_business
      FROM business_tracking 
      WHERE user_id = ? AND level = 'level_1'
    `, [userId]);

    const [level2Business] = await db.pool.execute(`
      SELECT COALESCE(SUM(amount), 0) as level2_business
      FROM business_tracking 
      WHERE user_id = ? AND level = 'level_2'
    `, [userId]);

    const userData = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      account_balance: parseFloat(user.account_balance || 0),
      total_earning: parseFloat(user.total_earning || 0),
      rewards: parseFloat(user.rewards || 0),
      referral_code: user.referral_code,
      level1_income: parseFloat(level1Income[0].level1_income),
      level2_income: parseFloat(level2Income[0].level2_income),
      level1_business: parseFloat(level1Business[0].level1_business),
      level2_business: parseFloat(level2Business[0].level2_business)
    };

        res.json({
            success: true,
      data: userData
        });

    } catch (error) {
    console.error('Get user data error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Track business volume when someone makes a transaction
const trackBusinessVolume = async (userId, amount, transactionType = 'deposit') => {
  try {
    // Get the user's referrer (Level 1)
    const [referrer] = await db.pool.execute(
      'SELECT user_id, referrer_id FROM users WHERE user_id = ?',
      [userId]
    );

    if (referrer.length === 0 || !referrer[0].referrer_id) {
      return; // No referrer, no business to track
    }

    const level1ReferrerId = referrer[0].referrer_id;

    // Track Level 1 business
    await db.pool.execute(
      `INSERT INTO business_tracking (user_id, source_user_id, amount, level, transaction_type)
       VALUES (?, ?, ?, 'level_1', ?)`,
      [level1ReferrerId, userId, amount, transactionType]
    );

    // Get Level 1 referrer's referrer (Level 2)
    const [level2Referrer] = await db.pool.execute(
      'SELECT referrer_id FROM users WHERE user_id = ?',
      [level1ReferrerId]
    );

    if (level2Referrer.length > 0 && level2Referrer[0].referrer_id) {
      const level2ReferrerId = level2Referrer[0].referrer_id;

      // Track Level 2 business
      await db.pool.execute(
        `INSERT INTO business_tracking (user_id, source_user_id, amount, level, transaction_type)
         VALUES (?, ?, ?, 'level_2', ?)`,
        [level2ReferrerId, userId, amount, transactionType]
      );
    }

    console.log(`✅ Tracked business volume for transaction: ${amount}`);
  } catch (error) {
    console.error('Error tracking business volume:', error);
  }
};

// Get referral list
const getReferralList = async (req, res) => {
    try {
        const userId = req.user.user_id;

    // Get Level 1 referrals
    const [level1Referrals] = await db.pool.execute(`
      SELECT u.user_id, u.name, u.email, u.created_at,
             COALESCE(SUM(bt.amount), 0) as total_business
      FROM users u
      LEFT JOIN business_tracking bt ON u.user_id = bt.source_user_id AND bt.level = 'level_1'
      WHERE u.referrer_id = ?
      GROUP BY u.user_id, u.name, u.email, u.created_at
      ORDER BY u.created_at DESC
    `, [userId]);

    // Get Level 2 referrals
    const [level2Referrals] = await db.pool.execute(`
      SELECT u.user_id, u.name, u.email, u.created_at,
             COALESCE(SUM(bt.amount), 0) as total_business
      FROM users u
      LEFT JOIN business_tracking bt ON u.user_id = bt.source_user_id AND bt.level = 'level_2'
      WHERE u.referrer_id IN (
        SELECT user_id FROM users WHERE referrer_id = ?
      )
      GROUP BY u.user_id, u.name, u.email, u.created_at
      ORDER BY u.created_at DESC
    `, [userId]);

        res.json({
            success: true,
      data: {
        level1_referrals: level1Referrals,
        level2_referrals: level2Referrals
      }
        });

    } catch (error) {
        console.error('Get referral list error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get referral link
const getReferralLink = async (req, res) => {
    try {
        const userId = req.user.user_id;
    
    const [user] = await db.pool.execute(
      'SELECT referral_code FROM users WHERE user_id = ?',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const referralCode = user[0].referral_code;
    const referralLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/signup?ref=${referralCode}`;

        res.json({
            success: true,
            data: {
        referral_code: referralCode,
        referral_link: referralLink
            }
        });

    } catch (error) {
        console.error('Get referral link error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get transaction history
const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.user_id;
    const { type, limit = 50 } = req.query;
    
    let query = `
      SELECT type, amount, description, timestamp, status
            FROM transactions 
      WHERE user_id = ?
    `;
    let params = [userId];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [transactions] = await db.pool.execute(query, params);

        res.json({
            success: true,
      data: transactions
        });

    } catch (error) {
    console.error('Get transaction history error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get Level 1 Income transactions
const getLevel1IncomeTransactions = async (req, res) => {
    try {
    const userId = req.user.user_id;
    
    const [transactions] = await db.pool.execute(`
      SELECT e.amount, e.description, e.created_at, u.name as source_name
      FROM earnings e
      LEFT JOIN users u ON e.source_user_id = u.user_id
      WHERE e.user_id = ? AND e.type = 'referral_level_1'
      ORDER BY e.created_at DESC
    `, [userId]);
        
        res.json({
            success: true,
      data: transactions
    });

    } catch (error) {
    console.error('Get Level 1 income error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    }
};

// Get Level 2 Income transactions
const getLevel2IncomeTransactions = async (req, res) => {
    try {
    const userId = req.user.user_id;
    
    const [transactions] = await db.pool.execute(`
      SELECT e.amount, e.description, e.created_at, u.name as source_name
      FROM earnings e
      LEFT JOIN users u ON e.source_user_id = u.user_id
      WHERE e.user_id = ? AND e.type = 'referral_level_2'
      ORDER BY e.created_at DESC
    `, [userId]);
        
        res.json({
            success: true,
      data: transactions
    });

    } catch (error) {
    console.error('Get Level 2 income error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    }
};

// Get Level 1 Business transactions
const getLevel1BusinessTransactions = async (req, res) => {
    try {
    const userId = req.user.user_id;
    
    const [transactions] = await db.pool.execute(`
      SELECT bt.amount, bt.transaction_type, bt.created_at, u.name as source_name
      FROM business_tracking bt
      LEFT JOIN users u ON bt.source_user_id = u.user_id
      WHERE bt.user_id = ? AND bt.level = 'level_1'
      ORDER BY bt.created_at DESC
    `, [userId]);
        
        res.json({
            success: true,
      data: transactions
    });

    } catch (error) {
    console.error('Get Level 1 business error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    }
};

// Get Level 2 Business transactions
const getLevel2BusinessTransactions = async (req, res) => {
    try {
    const userId = req.user.user_id;
    
    const [transactions] = await db.pool.execute(`
      SELECT bt.amount, bt.transaction_type, bt.created_at, u.name as source_name
      FROM business_tracking bt
      LEFT JOIN users u ON bt.source_user_id = u.user_id
      WHERE bt.user_id = ? AND bt.level = 'level_2'
      ORDER BY bt.created_at DESC
    `, [userId]);
        
        res.json({
            success: true,
      data: transactions
    });

    } catch (error) {
    console.error('Get Level 2 business error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get cashback transactions (rewards)
const getCashbackTransactions = async (req, res) => {
    try {
        const userId = req.user.user_id;

    const [transactions] = await db.pool.execute(`
      SELECT e.amount, e.description, e.created_at
      FROM earnings e
      WHERE e.user_id = ? AND e.type = 'rewards'
      ORDER BY e.created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('Get cashback error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get withdrawal history
const getWithdrawalHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const [transactions] = await db.pool.execute(`
      SELECT amount, description, timestamp, status
      FROM transactions 
      WHERE user_id = ? AND type = 'withdrawal'
      ORDER BY timestamp DESC
    `, [userId]);

        res.json({
            success: true,
      data: transactions
    });

    } catch (error) {
    console.error('Get withdrawal history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Demo data functions (for testing)
const getDemoDashboardData = async (req, res) => {
  res.json({
    success: true,
    data: {
      account_balance: 1250.50,
      total_earnings: 850.25,
      level1_income: 450.00,
      level2_income: 200.25,
      rewards: 200.00,
      level1_business: 4500.00,
      level2_business: 2000.00
    }
  });
};

module.exports = {
    getDashboardData,
  getUserData,
  trackBusinessVolume,
    getReferralList,
    getReferralLink,
    getTransactionHistory,
    getLevel1IncomeTransactions,
    getLevel2IncomeTransactions,
    getLevel1BusinessTransactions,
  getLevel2BusinessTransactions,
  getCashbackTransactions,
  getWithdrawalHistory,
  getDemoDashboardData
};