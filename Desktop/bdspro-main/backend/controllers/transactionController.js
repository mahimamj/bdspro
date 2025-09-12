const { validationResult } = require('express-validator');
const { pool } = require('../config/database');

// Create deposit request
const createDeposit = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const userId = req.user.user_id;
        const { amount, method, note } = req.body;

        // Validate minimum deposit amount
        if (amount < 50) {
            return res.status(400).json({
                success: false,
                message: 'Minimum deposit amount is 50 USDT'
            });
        }

        // Create deposit transaction
        const [result] = await pool.execute(
            `INSERT INTO transactions (user_id, type, amount, credit, debit, balance, description, status) 
             VALUES (?, 'deposit', ?, ?, 0, ?, ?)`,
            [
                userId,
                amount,
                amount,
                amount,
                `Deposit via ${method}${note ? ` - ${note}` : ''}`
            ]
        );

        // Update user balance
        await pool.execute(
            'UPDATE users SET account_balance = account_balance + ? WHERE user_id = ?',
            [amount, userId]
        );

        res.status(201).json({
            success: true,
            message: 'Deposit request created successfully',
            data: {
                transaction_id: result.insertId,
                amount,
                status: 'pending'
            }
        });

    } catch (error) {
        console.error('Create deposit error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create withdrawal request
const createWithdrawal = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const userId = req.user.user_id;
        const { amount, address, note } = req.body;

        // Validate minimum withdrawal amount
        if (amount < 10) {
            return res.status(400).json({
                success: false,
                message: 'Minimum withdrawal amount is 10 USDT'
            });
        }

        // Check user balance
        const [users] = await pool.execute(
            'SELECT account_balance FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const currentBalance = users[0].account_balance;

        if (amount > currentBalance) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance for withdrawal'
            });
        }

        // Validate USDT address
        if (!address || address.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid USDT address'
            });
        }

        // Create withdrawal transaction
        const [result] = await pool.execute(
            `INSERT INTO transactions (user_id, type, amount, credit, debit, balance, description, status) 
             VALUES (?, 'withdrawal', ?, 0, ?, ?, ?)`,
            [
                userId,
                amount,
                amount,
                currentBalance - amount,
                `Withdrawal to ${address.substring(0, 10)}...${note ? ` - ${note}` : ''}`
            ]
        );

        // Update user balance
        await pool.execute(
            'UPDATE users SET account_balance = account_balance - ? WHERE user_id = ?',
            [amount, userId]
        );

        res.status(201).json({
            success: true,
            message: 'Withdrawal request created successfully',
            data: {
                transaction_id: result.insertId,
                amount,
                status: 'pending'
            }
        });

    } catch (error) {
        console.error('Create withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get transaction history with filters
const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { 
            type = 'all', 
            status = 'all', 
            page = 1, 
            limit = 20,
            startDate,
            endDate
        } = req.query;

        let whereConditions = ['user_id = ?'];
        let params = [userId];

        // Type filter
        if (type !== 'all') {
            whereConditions.push('type = ?');
            params.push(type);
        }

        // Status filter
        if (status !== 'all') {
            whereConditions.push('status = ?');
            params.push(status);
        }

        // Date range filter
        if (startDate && endDate) {
            whereConditions.push('DATE(timestamp) BETWEEN ? AND ?');
            params.push(startDate, endDate);
        }

        const whereClause = whereConditions.join(' AND ');

        // Get total count
        const [countResult] = await pool.execute(
            `SELECT COUNT(*) as total FROM transactions WHERE ${whereClause}`,
            params
        );

        const total = countResult[0].total;
        const offset = (page - 1) * limit;

        // Get transactions
        const [transactions] = await pool.execute(
            `SELECT 
                id, type, amount, credit, debit, balance, description, status, timestamp
             FROM transactions 
             WHERE ${whereClause}
             ORDER BY timestamp DESC 
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        // Format transactions
        const formattedTransactions = transactions.map(t => ({
            ...t,
            timestamp: new Date(t.timestamp).toISOString(),
            date: new Date(t.timestamp).toLocaleDateString(),
            type_label: getTypeLabel(t.type)
        }));

        res.json({
            success: true,
            data: {
                transactions: formattedTransactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get transaction history error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Helper function to get type labels
const getTypeLabel = (type) => {
    const labels = {
        'deposit': 'Deposit',
        'withdrawal': 'Withdrawal',
        'cashback': 'My Cashback',
        'level1_income': 'Level 1 Income',
        'level2_income': 'Level 2 Income',
        'reward': 'Reward'
    };
    return labels[type] || type;
};

module.exports = {
    createDeposit,
    createWithdrawal,
    getTransactionHistory
};

// Get transactions by dashboard card category from real transactions table

const getTransactionsByCategory = async (req, res) => {
    try {
        const { category, withdrawal_from, start, end } = req.query;

        if (!category) {
            return res.status(400).json({ success: false, message: 'category is required' });
        }

        // Skip Rewards per requirement
        if (String(category).toLowerCase() === 'rewards') {
            return res.status(400).json({ success: false, message: 'Rewards is excluded from this operation' });
        }

        // Map dashboard categories to transaction types
        const categoryToTypeMap = {
            'Account Balance': ['deposit', 'withdrawal', 'growth'],
            'Total Earnings': ['deposit', 'growth', 'level1_income', 'level2_income'],
            'My Level 1 Income': ['level1_income'],
            'My Level 1 Business': ['level1_business'],
            'My Level 2 Income': ['level2_income'],
            'My Level 2 Business': ['level2_business']
        };

        const transactionTypes = categoryToTypeMap[category] || [];
        if (transactionTypes.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // Build filters for real transactions table
        const where = ['type IN (' + transactionTypes.map(() => '?').join(',') + ')'];
        const params = [...transactionTypes];
        
        if (withdrawal_from) {
            // Map withdrawal_from filter to transaction types
            const fromToTypeMap = {
                'Cashback': ['growth'],
                'Level 1': ['level1_income'],
                'Level 2': ['level2_income'],
                'Business': ['level1_business', 'level2_business']
            };
            
            const fromTypes = fromToTypeMap[withdrawal_from] || [];
            if (fromTypes.length > 0) {
                where.push('type IN (' + fromTypes.map(() => '?').join(',') + ')');
                params.push(...fromTypes);
            }
        }
        
        if (start && end) {
            where.push('DATE(timestamp) BETWEEN ? AND ?');
            params.push(start, end);
        }

        const [rows] = await pool.execute(
            `SELECT 
                timestamp as date, 
                amount as withdrawal_amount, 
                CONCAT('TX', id) as transaction_id,
                CASE 
                    WHEN type = 'growth' THEN 'Cashback'
                    WHEN type = 'level1_income' THEN 'Level 1'
                    WHEN type = 'level2_income' THEN 'Level 2'
                    WHEN type = 'level1_business' THEN 'Business'
                    WHEN type = 'level2_business' THEN 'Business'
                    WHEN type = 'deposit' THEN 'Deposit'
                    WHEN type = 'withdrawal' THEN 'Withdrawal'
                    ELSE type
                END as withdrawal_from
             FROM transactions
             WHERE ${where.join(' AND ')}
             ORDER BY timestamp DESC
             LIMIT 50`,
            params
        );

        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error('getTransactionsByCategory error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports.getTransactionsByCategory = getTransactionsByCategory;

// helpers
function pad2(n) { return n.toString().padStart(2, '0'); }
function formatDateTime(d) {
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const mi = pad2(d.getMinutes());
    const ss = pad2(d.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}