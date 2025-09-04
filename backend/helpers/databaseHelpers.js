const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bds_pro_db',
  port: process.env.DB_PORT || 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Helper function to get connection
const getConnection = async () => {
  return await pool.getConnection();
};

// Helper function to execute query
const executeQuery = async (query, params = []) => {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } finally {
    connection.release();
  }
};

// Helper function to execute transaction
const executeTransaction = async (queries) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// User operations
const getUserById = async (userId) => {
  const query = 'SELECT * FROM users WHERE user_id = ?';
  const results = await executeQuery(query, [userId]);
  return results[0] || null;
};

const getUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  const results = await executeQuery(query, [email]);
  return results[0] || null;
};

const createUser = async (userId, name, email, hashedPassword, referralCode = null, referrerId = null) => {
  try {
    console.log('Creating user with params:', { userId, name, email, referralCode, referrerId });
    const query = `
      INSERT INTO users (name, email, password_hash, referral_code, referrer_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const result = await executeQuery(query, [name, email, hashedPassword, referralCode, referrerId]);
    console.log('User creation result:', result);
    return result;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

const updateUserPassword = async (userId, hashedPassword) => {
  const query = 'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?';
  return await executeQuery(query, [hashedPassword, userId]);
};

const updateUserVerification = async (userId, isVerified) => {
  const query = 'UPDATE users SET is_verified = ?, updated_at = NOW() WHERE user_id = ?';
  return await executeQuery(query, [isVerified, userId]);
};

const updateUserBalance = async (userId, newBalance) => {
  const query = 'UPDATE users SET account_balance = ?, updated_at = NOW() WHERE user_id = ?';
  return await executeQuery(query, [newBalance, userId]);
};

const updateUserEarnings = async (userId, totalEarning, rewards) => {
  const query = 'UPDATE users SET total_earning = ?, rewards = ?, updated_at = NOW() WHERE user_id = ?';
  return await executeQuery(query, [totalEarning, rewards, userId]);
};

// Transaction operations
const createTransaction = async (userId, type, amount, credit, debit, balance, description, status = 'completed', relatedUserId = null, relatedTransactionId = null) => {
  const query = `
    INSERT INTO transactions (user_id, type, amount, credit, debit, balance, description, status, related_user_id, related_transaction_id, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  return await executeQuery(query, [userId, type, amount, credit, debit, balance, description, status, relatedUserId, relatedTransactionId]);
};

const getTransactionsByUserId = async (userId, limit = 50) => {
  const query = `
    SELECT * FROM transactions 
    WHERE user_id = ? 
    ORDER BY timestamp DESC 
    LIMIT ?
  `;
  return await executeQuery(query, [userId, limit]);
};

// Referral operations
const getReferrerByUserId = async (userId) => {
  const query = `
    SELECT r.referrer_id, u.name, u.email 
    FROM referrals r 
    JOIN users u ON r.referrer_id = u.user_id 
    WHERE r.referred_id = ?
  `;
  const results = await executeQuery(query, [userId]);
  return results[0] || null;
};

const getReferralChain = async (userId) => {
  const query = `
    SELECT 
      r1.referrer_id as level1_referrer,
      r2.referrer_id as level2_referrer
    FROM referrals r1
    LEFT JOIN referrals r2 ON r1.referrer_id = r2.referred_id
    WHERE r1.referred_id = ?
  `;
  const results = await executeQuery(query, [userId]);
  return results[0] || null;
};

const createReferral = async (referrerId, referredId, level) => {
  const query = 'INSERT INTO referrals (referrer_id, referred_id, level, created_at) VALUES (?, ?, ?, NOW())';
  return await executeQuery(query, [referrerId, referredId, level]);
};

// Network operations
const getNetworkStats = async (userId) => {
  const query = 'SELECT * FROM network WHERE user_id = ?';
  const results = await executeQuery(query, [userId]);
  return results[0] || null;
};

const createNetworkStats = async (userId) => {
  const query = `
    INSERT INTO network (user_id, level1_income, level2_income, level1_business, level2_business, created_at, updated_at)
    VALUES (?, 0, 0, 0, 0, NOW(), NOW())
  `;
  return await executeQuery(query, [userId]);
};

const updateNetworkStats = async (userId, level1Income = 0, level2Income = 0, level1Business = 0, level2Business = 0) => {
  const query = `
    UPDATE network 
    SET level1_income = level1_income + ?, 
        level2_income = level2_income + ?, 
        level1_business = level1_business + ?, 
        level2_business = level2_business + ?,
        updated_at = NOW()
    WHERE user_id = ?
  `;
  return await executeQuery(query, [level1Income, level2Income, level1Business, level2Business, userId]);
};

// Growth calculation
const getDepositsForGrowth = async () => {
  const query = `
    SELECT t.id, t.user_id, t.amount, t.timestamp
    FROM transactions t
    WHERE t.type = 'deposit' 
    AND t.timestamp <= DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND NOT EXISTS (
      SELECT 1 FROM growth_tracking gt 
      WHERE gt.original_deposit_id = t.id 
      AND gt.status = 'processed'
    )
  `;
  return await executeQuery(query);
};

// Growth tracking operations
const createGrowthTracking = async (userId, originalDepositId, originalAmount, growthAmount, growthPercentage = 6.00) => {
  const query = `
    INSERT INTO growth_tracking (user_id, original_deposit_id, original_amount, growth_amount, growth_percentage, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `;
  return await executeQuery(query, [userId, originalDepositId, originalAmount, growthAmount, growthPercentage]);
};

const updateGrowthTrackingStatus = async (trackingId, status) => {
  const query = 'UPDATE growth_tracking SET status = ?, processed_at = NOW() WHERE id = ?';
  return await executeQuery(query, [status, trackingId]);
};

// Referral income tracking operations
const createReferralIncomeTracking = async (referrerId, depositorId, depositTransactionId, level, referralIncome, businessVolume) => {
  const query = `
    INSERT INTO referral_income_tracking (referrer_id, depositor_id, deposit_transaction_id, level, referral_income, business_volume, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `;
  return await executeQuery(query, [referrerId, depositorId, depositTransactionId, level, referralIncome, businessVolume]);
};

const updateReferralIncomeTrackingStatus = async (trackingId, status) => {
  const query = 'UPDATE referral_income_tracking SET status = ?, processed_at = NOW() WHERE id = ?';
  return await executeQuery(query, [status, trackingId]);
};

// System settings operations
const getSystemSetting = async (settingKey) => {
  const query = 'SELECT setting_value FROM system_settings WHERE setting_key = ?';
  const results = await executeQuery(query, [settingKey]);
  return results[0]?.setting_value || null;
};

const updateSystemSetting = async (settingKey, settingValue) => {
  const query = `
    INSERT INTO system_settings (setting_key, setting_value) 
    VALUES (?, ?) 
    ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
  `;
  return await executeQuery(query, [settingKey, settingValue]);
};

const processGrowth = async (userId, originalDepositId, originalAmount) => {
  // Get system settings
  const growthPercentage = parseFloat(await getSystemSetting('growth_percentage')) || 6.00;
  const growthAmount = originalAmount * (growthPercentage / 100);
  
  // Get current balance
  const user = await getUserById(userId);
  if (!user) throw new Error('User not found');
  
  const newBalance = parseFloat(user.account_balance) + growthAmount;
  
  // Create growth tracking record
  const growthTracking = await createGrowthTracking(userId, originalDepositId, originalAmount, growthAmount, growthPercentage);
  const trackingId = growthTracking.insertId;
  
  try {
    // Update user balance
    await updateUserBalance(userId, newBalance);
    
    // Create growth transaction
    const growthTransaction = await createTransaction(
      userId, 
      'growth', 
      growthAmount, 
      growthAmount, 
      0, 
      newBalance, 
      `${growthPercentage}% monthly growth on deposit of $${originalAmount}`, 
      'completed',
      null,
      originalDepositId
    );
    
    // Update total earnings
    const newTotalEarning = parseFloat(user.total_earning) + growthAmount;
    await updateUserEarnings(userId, newTotalEarning, user.rewards);
    
    // Mark growth tracking as processed
    await updateGrowthTrackingStatus(trackingId, 'processed');
    
    return { 
      growthAmount, 
      newBalance, 
      newTotalEarning, 
      trackingId,
      growthTransactionId: growthTransaction.insertId
    };
    
  } catch (error) {
    // Mark growth tracking as failed
    await updateGrowthTrackingStatus(trackingId, 'failed');
    throw error;
  }
};

module.exports = {
  executeQuery,
  executeTransaction,
  getUserById,
  getUserByEmail,
  createUser,
  updateUserPassword,
  updateUserVerification,
  updateUserBalance,
  updateUserEarnings,
  createTransaction,
  getTransactionsByUserId,
  getReferrerByUserId,
  getReferralChain,
  createReferral,
  getNetworkStats,
  createNetworkStats,
  updateNetworkStats,
  getDepositsForGrowth,
  processGrowth,
  createGrowthTracking,
  updateGrowthTrackingStatus,
  createReferralIncomeTracking,
  updateReferralIncomeTrackingStatus,
  getSystemSetting,
  updateSystemSetting
};
