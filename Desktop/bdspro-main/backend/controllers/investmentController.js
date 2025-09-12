const db = require('../config/database');
const { processReferralEarnings, processInvestmentMaturity } = require('./referralController');
const { trackBusinessVolume } = require('./dashboardController');

// Create a new investment
const createInvestment = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.user_id;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid investment amount'
            });
        }
        
        // Check if user has sufficient balance
        const [users] = await db.pool.execute(
            'SELECT account_balance FROM users WHERE user_id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const currentBalance = parseFloat(users[0].account_balance);
        if (currentBalance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }
        
        // Calculate maturity date (1 month from now)
        const depositDate = new Date();
        const maturityDate = new Date();
        maturityDate.setMonth(maturityDate.getMonth() + 1);
        
        // Create investment record
        const [result] = await db.pool.execute(
            `INSERT INTO investments (user_id, amount, deposit_date, maturity_date, status)
             VALUES (?, ?, ?, ?, 'active')`,
            [userId, amount, depositDate, maturityDate]
        );
        
        const investmentId = result.insertId;
        
        // Deduct amount from user's account balance
        await db.pool.execute(
            'UPDATE users SET account_balance = account_balance - ? WHERE user_id = ?',
            [amount, userId]
        );
        
        // Create transaction record
        await db.pool.execute(
            `INSERT INTO transactions (user_id, type, amount, credit, debit, balance, description, status)
             VALUES (?, 'deposit', ?, 0, ?, ?, ?, 'completed')`,
            [userId, amount, amount, currentBalance - amount, `Investment of $${amount} for 1 month`]
        );

        // Track business volume for referrals
        await trackBusinessVolume(userId, amount, 'investment');
        
        res.json({
            success: true,
            message: 'Investment created successfully',
            data: {
                investment_id: investmentId,
                amount: amount,
                deposit_date: depositDate,
                maturity_date: maturityDate,
                expected_growth: amount * 0.06
            }
        });
    } catch (error) {
        console.error('Create investment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get user's investments
const getUserInvestments = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { status } = req.query;
        
        let query = 'SELECT * FROM investments WHERE user_id = ?';
        let params = [userId];
        
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const [investments] = await db.pool.execute(query, params);
        
        res.json({
            success: true,
            data: investments
        });
    } catch (error) {
        console.error('Get user investments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get user's earnings
const getUserEarnings = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { type } = req.query;
        
        let query = `
            SELECT e.*, u.name as source_user_name, i.amount as investment_amount
            FROM earnings e
            LEFT JOIN users u ON e.source_user_id = u.user_id
            LEFT JOIN investments i ON e.investment_id = i.investment_id
            WHERE e.user_id = ?
        `;
        let params = [userId];
        
        if (type) {
            query += ' AND e.type = ?';
            params.push(type);
        }
        
        query += ' ORDER BY e.created_at DESC';
        
        const [earnings] = await db.pool.execute(query, params);
        
        res.json({
            success: true,
            data: earnings
        });
    } catch (error) {
        console.error('Get user earnings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Process matured investments (cron job)
const processMaturedInvestments = async () => {
    try {
        console.log('Processing matured investments...');
        
        // Get all active investments that have matured
        const [maturedInvestments] = await db.pool.execute(
            'SELECT investment_id FROM investments WHERE status = "active" AND maturity_date <= CURDATE()'
        );
        
        for (const investment of maturedInvestments) {
            await processInvestmentMaturity(investment.investment_id);
        }
        
        console.log(`✅ Processed ${maturedInvestments.length} matured investments`);
    } catch (error) {
        console.error('Error processing matured investments:', error);
    }
};

// Get investment statistics
const getInvestmentStats = async (req, res) => {
    try {
        const userId = req.user.user_id;
        
        // Get total invested amount
        const [totalInvested] = await db.pool.execute(
            'SELECT COALESCE(SUM(amount), 0) as total FROM investments WHERE user_id = ?',
            [userId]
        );
        
        // Get total growth earned
        const [totalGrowth] = await db.pool.execute(
            'SELECT COALESCE(SUM(amount), 0) as total FROM earnings WHERE user_id = ? AND type = "self_growth"',
            [userId]
        );
        
        // Get active investments
        const [activeInvestments] = await db.pool.execute(
            'SELECT COUNT(*) as count FROM investments WHERE user_id = ? AND status = "active"',
            [userId]
        );
        
        // Get matured investments
        const [maturedInvestments] = await db.pool.execute(
            'SELECT COUNT(*) as count FROM investments WHERE user_id = ? AND status = "matured"',
            [userId]
        );
        
        res.json({
            success: true,
            data: {
                total_invested: totalInvested[0].total,
                total_growth: totalGrowth[0].total,
                active_investments: activeInvestments[0].count,
                matured_investments: maturedInvestments[0].count
            }
        });
    } catch (error) {
        console.error('Get investment stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    createInvestment,
    getUserInvestments,
    getUserEarnings,
    processMaturedInvestments,
    getInvestmentStats
};
