const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Generate unique referral code
const generateReferralCode = () => {
    const prefix = 'BDS';
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${randomPart}`;
};

// Get user's referral link
const getReferralLink = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        // Get user's referral code
        const [users] = await db.pool.execute(
            'SELECT referral_code FROM users WHERE user_id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const referralCode = users[0].referral_code;
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

// Get referral statistics
const getReferralStats = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        // Get level 1 referrals (direct referrals)
        const [level1Referrals] = await db.pool.execute(
            `SELECT u.user_id, u.name, u.email, u.created_at, 
                    COALESCE(SUM(i.amount), 0) as total_invested
             FROM users u
             LEFT JOIN investments i ON u.user_id = i.user_id
             WHERE u.referrer_id = ?
             GROUP BY u.user_id, u.name, u.email, u.created_at
             ORDER BY u.created_at DESC`,
            [userId]
        );
        
        // Get level 2 referrals (referrals of referrals)
        const [level2Referrals] = await db.pool.execute(
            `SELECT u.user_id, u.name, u.email, u.created_at,
                    COALESCE(SUM(i.amount), 0) as total_invested
             FROM users u
             LEFT JOIN investments i ON u.user_id = i.user_id
             WHERE u.referrer_id IN (
                 SELECT user_id FROM users WHERE referrer_id = ?
             )
             GROUP BY u.user_id, u.name, u.email, u.created_at
             ORDER BY u.created_at DESC`,
            [userId]
        );
        
        // Get total referral earnings
        const [totalEarnings] = await db.pool.execute(
            `SELECT 
                COALESCE(SUM(CASE WHEN type = 'referral_level_1' THEN amount ELSE 0 END), 0) as level1_earnings,
                COALESCE(SUM(CASE WHEN type = 'referral_level_2' THEN amount ELSE 0 END), 0) as level2_earnings,
                COALESCE(SUM(amount), 0) as total_earnings
             FROM earnings 
             WHERE user_id = ? AND type IN ('referral_level_1', 'referral_level_2')`,
            [userId]
        );
        
        res.json({
            success: true,
            data: {
                level1_referrals: level1Referrals,
                level2_referrals: level2Referrals,
                level1_count: level1Referrals.length,
                level2_count: level2Referrals.length,
                total_referrals: level1Referrals.length + level2Referrals.length,
                earnings: totalEarnings[0]
            }
        });
    } catch (error) {
        console.error('Get referral stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Process referral earnings when someone makes an investment
const processReferralEarnings = async (userId, investmentAmount, investmentId) => {
    try {
        // Get the investor's referrer (Level 1)
        const [referrer] = await db.pool.execute(
            'SELECT user_id, referrer_id FROM users WHERE user_id = ?',
            [userId]
        );
        
        if (referrer.length === 0 || !referrer[0].referrer_id) {
            return; // No referrer, no earnings to process
        }
        
        const level1ReferrerId = referrer[0].referrer_id;
        const level1Earning = investmentAmount * 0.01; // 1% for Level 1
        
        // Create Level 1 earnings record
        await db.pool.execute(
            `INSERT INTO earnings (user_id, source_user_id, amount, type, investment_id, description)
             VALUES (?, ?, ?, 'referral_level_1', ?, ?)`,
            [level1ReferrerId, userId, level1Earning, investmentId, `1% referral earning from user ${userId}`]
        );
        
        // Update Level 1 referrer's account balance
        await db.pool.execute(
            'UPDATE users SET account_balance = account_balance + ?, total_earning = total_earning + ? WHERE user_id = ?',
            [level1Earning, level1Earning, level1ReferrerId]
        );
        
        // Get Level 1 referrer's referrer (Level 2)
        const [level2Referrer] = await db.pool.execute(
            'SELECT user_id FROM users WHERE user_id = ?',
            [level1ReferrerId]
        );
        
        if (level2Referrer.length > 0) {
            const [level2Data] = await db.pool.execute(
                'SELECT referrer_id FROM users WHERE user_id = ?',
                [level1ReferrerId]
            );
            
            if (level2Data.length > 0 && level2Data[0].referrer_id) {
                const level2ReferrerId = level2Data[0].referrer_id;
                const level2Earning = investmentAmount * 0.01; // 1% for Level 2
                
                // Create Level 2 earnings record
                await db.pool.execute(
                    `INSERT INTO earnings (user_id, source_user_id, amount, type, investment_id, description)
                     VALUES (?, ?, ?, 'referral_level_2', ?, ?)`,
                    [level2ReferrerId, userId, level2Earning, investmentId, `1% referral earning from user ${userId} (Level 2)`]
                );
                
                // Update Level 2 referrer's account balance
                await db.pool.execute(
                    'UPDATE users SET account_balance = account_balance + ?, total_earning = total_earning + ? WHERE user_id = ?',
                    [level2Earning, level2Earning, level2ReferrerId]
                );
            }
        }
        
        console.log(`✅ Processed referral earnings for investment ${investmentId}`);
    } catch (error) {
        console.error('Error processing referral earnings:', error);
    }
};

// Process investment maturity (6% growth after 1 month)
const processInvestmentMaturity = async (investmentId) => {
    try {
        // Get investment details
        const [investments] = await db.pool.execute(
            'SELECT user_id, amount FROM investments WHERE investment_id = ? AND status = "active"',
            [investmentId]
        );
        
        if (investments.length === 0) {
            return;
        }
        
        const { user_id, amount } = investments[0];
        const growthAmount = amount * 0.06; // 6% growth
        
        // Update investment status and growth amount
        await db.pool.execute(
            'UPDATE investments SET status = "matured", growth_amount = ? WHERE investment_id = ?',
            [growthAmount, investmentId]
        );
        
        // Create self growth earnings record
        await db.pool.execute(
            `INSERT INTO earnings (user_id, source_user_id, amount, type, investment_id, description)
             VALUES (?, ?, ?, 'self_growth', ?, ?)`,
            [user_id, user_id, growthAmount, investmentId, `6% growth on investment of $${amount}`]
        );
        
        // Update user's account balance
        await db.pool.execute(
            'UPDATE users SET account_balance = account_balance + ?, total_earning = total_earning + ? WHERE user_id = ?',
            [growthAmount, growthAmount, user_id]
        );
        
        // Process referral earnings
        await processReferralEarnings(user_id, amount, investmentId);
        
        console.log(`✅ Processed investment maturity for investment ${investmentId}`);
    } catch (error) {
        console.error('Error processing investment maturity:', error);
    }
};

module.exports = {
    generateReferralCode,
    getReferralLink,
    getReferralStats,
    processReferralEarnings,
    processInvestmentMaturity
};
