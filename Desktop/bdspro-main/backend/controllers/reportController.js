const { executeQuery } = require('../helpers/databaseHelpers');

// Get comprehensive user report
const getUserReport = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user summary
    const userQuery = `
      SELECT * FROM user_summary WHERE user_id = ?
    `;
    const [user] = await executeQuery(userQuery, [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all transactions
    const transactionsQuery = `
      SELECT * FROM transaction_summary 
      WHERE user_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 50
    `;
    const transactions = await executeQuery(transactionsQuery, [userId]);

    // Get referral network
    const referralsQuery = `
      SELECT * FROM referral_network 
      WHERE referrer_id = ? OR referred_id = ?
      ORDER BY created_at DESC
    `;
    const referrals = await executeQuery(referralsQuery, [userId, userId]);

    // Get growth tracking
    const growthQuery = `
      SELECT gt.*, t.amount as original_amount, t.timestamp as deposit_timestamp
      FROM growth_tracking gt
      JOIN transactions t ON gt.original_deposit_id = t.id
      WHERE gt.user_id = ?
      ORDER BY gt.processed_at DESC
    `;
    const growthHistory = await executeQuery(growthQuery, [userId]);

    // Get referral income tracking
    const referralIncomeQuery = `
      SELECT rit.*, 
             u1.name as referrer_name,
             u2.name as depositor_name,
             t.amount as deposit_amount,
             t.timestamp as deposit_timestamp
      FROM referral_income_tracking rit
      LEFT JOIN users u1 ON rit.referrer_id = u1.user_id
      LEFT JOIN users u2 ON rit.depositor_id = u2.user_id
      LEFT JOIN transactions t ON rit.deposit_transaction_id = t.id
      WHERE rit.referrer_id = ?
      ORDER BY rit.processed_at DESC
    `;
    const referralIncomeHistory = await executeQuery(referralIncomeQuery, [userId]);

    res.json({
      success: true,
      data: {
        user: {
          userId: user.user_id,
          name: user.name,
          email: user.email,
          accountBalance: parseFloat(user.account_balance),
          totalEarning: parseFloat(user.total_earning),
          rewards: parseFloat(user.rewards),
          createdAt: user.created_at,
          updatedAt: user.updated_at
        },
        networkStats: {
          level1Income: parseFloat(user.level1_income),
          level2Income: parseFloat(user.level2_income),
          level1Business: parseFloat(user.level1_business),
          level2Business: parseFloat(user.level2_business),
          totalReferralIncome: parseFloat(user.total_referral_income),
          totalBusinessVolume: parseFloat(user.total_business_volume)
        },
        transactions: transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: parseFloat(t.amount),
          credit: parseFloat(t.credit),
          debit: parseFloat(t.debit),
          balance: parseFloat(t.balance),
          description: t.description,
          status: t.status,
          relatedUser: t.related_user_name,
          timestamp: t.timestamp
        })),
        referrals: referrals.map(r => ({
          id: r.id,
          referrerId: r.referrer_id,
          referrerName: r.referrer_name,
          referredId: r.referred_id,
          referredName: r.referred_name,
          level: r.level,
          createdAt: r.created_at
        })),
        growthHistory: growthHistory.map(g => ({
          id: g.id,
          originalAmount: parseFloat(g.original_amount),
          growthAmount: parseFloat(g.growth_amount),
          growthPercentage: parseFloat(g.growth_percentage),
          status: g.status,
          depositTimestamp: g.deposit_timestamp,
          processedAt: g.processed_at
        })),
        referralIncomeHistory: referralIncomeHistory.map(r => ({
          id: r.id,
          referrerName: r.referrer_name,
          depositorName: r.depositor_name,
          level: r.level,
          referralIncome: parseFloat(r.referral_income),
          businessVolume: parseFloat(r.business_volume),
          status: r.status,
          depositAmount: parseFloat(r.deposit_amount),
          depositTimestamp: r.deposit_timestamp,
          processedAt: r.processed_at
        }))
      }
    });

  } catch (error) {
    console.error('Get user report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get system-wide statistics
const getSystemStats = async (req, res) => {
  try {
    // Total users
    const [totalUsers] = await executeQuery('SELECT COUNT(*) as count FROM users');
    
    // Total deposits
    const [totalDeposits] = await executeQuery(`
      SELECT COUNT(*) as count, SUM(amount) as total 
      FROM transactions 
      WHERE type = 'deposit' AND status = 'completed'
    `);
    
    // Total growth paid
    const [totalGrowth] = await executeQuery(`
      SELECT COUNT(*) as count, SUM(amount) as total 
      FROM transactions 
      WHERE type = 'growth' AND status = 'completed'
    `);
    
    // Total referral income paid
    const [totalReferralIncome] = await executeQuery(`
      SELECT COUNT(*) as count, SUM(amount) as total 
      FROM transactions 
      WHERE type IN ('level1_income', 'level2_income') AND status = 'completed'
    `);
    
    // Active referrals
    const [activeReferrals] = await executeQuery('SELECT COUNT(*) as count FROM referrals');
    
    // Pending growth
    const [pendingGrowth] = await executeQuery(`
      SELECT COUNT(*) as count, SUM(growth_amount) as total 
      FROM growth_tracking 
      WHERE status = 'pending'
    `);
    
    // Pending referral income
    const [pendingReferralIncome] = await executeQuery(`
      SELECT COUNT(*) as count, SUM(referral_income) as total 
      FROM referral_income_tracking 
      WHERE status = 'pending'
    `);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers.count
        },
        deposits: {
          count: totalDeposits.count,
          total: parseFloat(totalDeposits.total || 0)
        },
        growth: {
          count: totalGrowth.count,
          total: parseFloat(totalGrowth.total || 0)
        },
        referralIncome: {
          count: totalReferralIncome.count,
          total: parseFloat(totalReferralIncome.total || 0)
        },
        referrals: {
          active: activeReferrals.count
        },
        pending: {
          growth: {
            count: pendingGrowth.count,
            total: parseFloat(pendingGrowth.total || 0)
          },
          referralIncome: {
            count: pendingReferralIncome.count,
            total: parseFloat(pendingReferralIncome.total || 0)
          }
        }
      }
    });

  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get detailed transaction report
const getTransactionReport = async (req, res) => {
  try {
    const { userId, type, startDate, endDate, limit = 100 } = req.query;

    let query = `
      SELECT ts.*, 
             CASE 
               WHEN ts.type = 'deposit' THEN 'Deposit'
               WHEN ts.type = 'growth' THEN 'Monthly Growth'
               WHEN ts.type = 'level1_income' THEN 'Level 1 Referral Income'
               WHEN ts.type = 'level2_income' THEN 'Level 2 Referral Income'
               WHEN ts.type = 'withdrawal' THEN 'Withdrawal'
               ELSE ts.type
             END as type_display
      FROM transaction_summary ts
      WHERE 1=1
    `;
    
    const params = [];

    if (userId) {
      query += ' AND ts.user_id = ?';
      params.push(userId);
    }

    if (type) {
      query += ' AND ts.type = ?';
      params.push(type);
    }

    if (startDate) {
      query += ' AND ts.timestamp >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND ts.timestamp <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY ts.timestamp DESC LIMIT ?';
    params.push(parseInt(limit));

    const transactions = await executeQuery(query, params);

    res.json({
      success: true,
      data: {
        transactions: transactions.map(t => ({
          id: t.id,
          userId: t.user_id,
          userName: t.user_name,
          type: t.type,
          typeDisplay: t.type_display,
          amount: parseFloat(t.amount),
          credit: parseFloat(t.credit),
          debit: parseFloat(t.debit),
          balance: parseFloat(t.balance),
          description: t.description,
          status: t.status,
          relatedUserId: t.related_user_id,
          relatedUserName: t.related_user_name,
          timestamp: t.timestamp
        })),
        total: transactions.length
      }
    });

  } catch (error) {
    console.error('Get transaction report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getUserReport,
  getSystemStats,
  getTransactionReport
};
