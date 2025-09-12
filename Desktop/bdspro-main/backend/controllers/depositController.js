const {
  executeTransaction,
  getUserById,
  updateUserBalance,
  updateUserEarnings,
  createTransaction,
  getReferralChain,
  createReferral,
  getNetworkStats,
  createNetworkStats,
  updateNetworkStats,
  createReferralIncomeTracking,
  updateReferralIncomeTrackingStatus,
  getSystemSetting
} = require('../helpers/databaseHelpers');

// Handle user deposit with referral logic
const processDeposit = async (req, res) => {
  try {
    const { userId, amount, referrerCode } = req.body;

    // Validate input
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId or amount'
      });
    }

    // Get user details
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const depositAmount = parseFloat(amount);
    const currentBalance = parseFloat(user.account_balance);
    const newBalance = currentBalance + depositAmount;

    // Prepare transaction queries
    const queries = [];

    // 1. Update user balance
    queries.push({
      query: 'UPDATE users SET account_balance = ?, updated_at = NOW() WHERE user_id = ?',
      params: [newBalance, userId]
    });

    // 2. Create deposit transaction
    queries.push({
      query: `INSERT INTO transactions (user_id, type, amount, credit, debit, balance, description, status, timestamp)
              VALUES (?, 'deposit', ?, ?, 0, ?, ?, 'completed', NOW())`,
      params: [userId, depositAmount, depositAmount, newBalance, `Deposit of $${depositAmount}`]
    });

    // 3. Handle referral logic if referrerCode is provided
    let referralResults = { level1Referrer: null, level2Referrer: null };
    
    if (referrerCode) {
      // Find referrer by code (assuming referrerCode is the referrer's user_id)
      const referrer = await getUserById(referrerCode);
      
      if (referrer && referrer.user_id !== userId) {
        // Create referral relationship
        queries.push({
          query: 'INSERT INTO referrals (referrer_id, referred_id, level, created_at) VALUES (?, ?, 1, NOW())',
          params: [referrer.user_id, userId]
        });

        // Get referrer's referrer for level 2
        const referralChain = await getReferralChain(referrer.user_id);
        if (referralChain && referralChain.level1_referrer) {
          referralResults.level2Referrer = referralChain.level1_referrer;
        }
        
        referralResults.level1Referrer = referrer.user_id;
      }
    }

    // Execute all queries in transaction
    const results = await executeTransaction(queries);
    
    // Get the deposit transaction ID from the results
    const depositTransactionId = results[1].insertId; // Second query is the deposit transaction

    // Create referral income tracking records
    if (referralResults.level1Referrer) {
      await createReferralIncomeTracking(
        referralResults.level1Referrer, 
        userId, 
        depositTransactionId, 
        1, 
        depositAmount * 0.01, 
        depositAmount
      );
    }
    
    if (referralResults.level2Referrer) {
      await createReferralIncomeTracking(
        referralResults.level2Referrer, 
        userId, 
        depositTransactionId, 
        2, 
        depositAmount * 0.01, 
        depositAmount
      );
    }

    // Process referral income after 1 month (simulated - in real app, use cron job)
    if (referralResults.level1Referrer) {
      await processReferralIncome(userId, depositAmount, referralResults, depositTransactionId);
    }

    res.json({
      success: true,
      message: 'Deposit processed successfully',
      data: {
        userId,
        depositAmount,
        newBalance,
        referralApplied: !!referralResults.level1Referrer,
        level1Referrer: referralResults.level1Referrer,
        level2Referrer: referralResults.level2Referrer
      }
    });

  } catch (error) {
    console.error('Deposit processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Process referral income (Level 1 & 2)
const processReferralIncome = async (depositorId, depositAmount, referralResults, depositTransactionId) => {
  try {
    const { level1Referrer, level2Referrer } = referralResults;
    
    // Get system settings
    const level1Percentage = parseFloat(await getSystemSetting('level1_referral_percentage')) || 1.00;
    const level2Percentage = parseFloat(await getSystemSetting('level2_referral_percentage')) || 1.00;
    
    const level1Income = depositAmount * (level1Percentage / 100);
    const level2Income = depositAmount * (level2Percentage / 100);

    // Process Level 1 referral income
    if (level1Referrer) {
      await processLevelReferralIncome(level1Referrer, depositorId, depositAmount, level1Income, 1, depositTransactionId);
    }

    // Process Level 2 referral income
    if (level2Referrer) {
      await processLevelReferralIncome(level2Referrer, depositorId, depositAmount, level2Income, 2, depositTransactionId);
    }

  } catch (error) {
    console.error('Referral income processing error:', error);
  }
};

// Process individual level referral income
const processLevelReferralIncome = async (referrerId, depositorId, depositAmount, referralIncome, level, depositTransactionId) => {
  try {
    // Get referrer details
    const referrer = await getUserById(referrerId);
    if (!referrer) return;

    const currentBalance = parseFloat(referrer.account_balance);
    const newBalance = currentBalance + referralIncome;

    // Prepare queries for transaction
    const queries = [];

    // Update referrer balance
    queries.push({
      query: 'UPDATE users SET account_balance = ?, updated_at = NOW() WHERE user_id = ?',
      params: [newBalance, referrerId]
    });

    // Create referral income transaction
    queries.push({
      query: `INSERT INTO transactions (user_id, type, amount, credit, debit, balance, description, status, related_user_id, related_transaction_id, timestamp)
              VALUES (?, ?, ?, ?, 0, ?, ?, 'completed', ?, ?, NOW())`,
      params: [
        referrerId, 
        `level${level}_income`, 
        referralIncome, 
        referralIncome, 
        newBalance, 
        `Level ${level} referral income from user ${depositorId} deposit of $${depositAmount}`,
        depositorId,
        depositTransactionId
      ]
    });

    // Update or create network stats
    const networkStats = await getNetworkStats(referrerId);
    if (!networkStats) {
      queries.push({
        query: 'INSERT INTO network (user_id, level1_income, level2_income, level1_business, level2_business, total_referral_income, total_business_volume, created_at, updated_at) VALUES (?, 0, 0, 0, 0, 0, 0, NOW(), NOW())',
        params: [referrerId]
      });
    }

    // Update network stats
    const level1Income = level === 1 ? referralIncome : 0;
    const level2Income = level === 2 ? referralIncome : 0;
    const level1Business = level === 1 ? depositAmount : 0;
    const level2Business = level === 2 ? depositAmount : 0;

    queries.push({
      query: `UPDATE network 
              SET level1_income = level1_income + ?, 
                  level2_income = level2_income + ?, 
                  level1_business = level1_business + ?, 
                  level2_business = level2_business + ?,
                  total_referral_income = total_referral_income + ?,
                  total_business_volume = total_business_volume + ?,
                  updated_at = NOW()
              WHERE user_id = ?`,
      params: [level1Income, level2Income, level1Business, level2Business, referralIncome, depositAmount, referrerId]
    });

    // Update total earnings and rewards
    const newTotalEarning = parseFloat(referrer.total_earning) + referralIncome;
    const newRewards = parseFloat(referrer.rewards) + referralIncome;

    queries.push({
      query: 'UPDATE users SET total_earning = ?, rewards = ?, updated_at = NOW() WHERE user_id = ?',
      params: [newTotalEarning, newRewards, referrerId]
    });

    // Execute all queries
    const results = await executeTransaction(queries);
    
    // Get the referral income transaction ID
    const referralTransactionId = results[1].insertId; // Second query is the referral income transaction
    
    // Update referral income tracking status
    const trackingQuery = `
      SELECT id FROM referral_income_tracking 
      WHERE referrer_id = ? AND depositor_id = ? AND deposit_transaction_id = ? AND level = ?
    `;
    const trackingRecords = await executeQuery(trackingQuery, [referrerId, depositorId, depositTransactionId, level]);
    
    if (trackingRecords.length > 0) {
      await updateReferralIncomeTrackingStatus(trackingRecords[0].id, 'processed');
    }

  } catch (error) {
    console.error(`Level ${level} referral income error:`, error);
  }
};

// Get user balance and earnings
const getUserBalance = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent transactions
    const transactions = await getTransactionsByUserId(userId, 10);

    res.json({
      success: true,
      data: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        accountBalance: parseFloat(user.account_balance),
        totalEarning: parseFloat(user.total_earning),
        rewards: parseFloat(user.rewards),
        recentTransactions: transactions
      }
    });

  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user network stats
const getUserNetwork = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let networkStats = await getNetworkStats(userId);
    
    // Create network stats if doesn't exist
    if (!networkStats) {
      await createNetworkStats(userId);
      networkStats = {
        level1_income: 0,
        level2_income: 0,
        level1_business: 0,
        level2_business: 0
      };
    }

    res.json({
      success: true,
      data: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        networkStats: {
          level1Income: parseFloat(networkStats.level1_income),
          level2Income: parseFloat(networkStats.level2_income),
          level1Business: parseFloat(networkStats.level1_business),
          level2Business: parseFloat(networkStats.level2_business),
          totalReferralIncome: parseFloat(networkStats.level1_income) + parseFloat(networkStats.level2_income),
          totalBusinessVolume: parseFloat(networkStats.level1_business) + parseFloat(networkStats.level2_business)
        }
      }
    });

  } catch (error) {
    console.error('Get network error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  processDeposit,
  getUserBalance,
  getUserNetwork
};
