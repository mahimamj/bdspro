const db = require('../config/database');

// Get deposit addresses for different networks
const getDepositAddresses = async (req, res) => {
    try {
        const addresses = {
            BEP20: {
                network: 'BSC BNB Smart Chain (BEP20)',
                address: '0xdfca28ad998742570aecb7ffde1fe564b7d42c30',
                minAmount: '0.01',
                qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=0xdfca28ad998742570aecb7ffde1fe564b7d42c30`
            },
            TRC20: {
                network: 'TRX Tron (TRC20)',
                address: 'TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt',
                minAmount: '0.01',
                qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt`
            }
        };

        res.json({
            success: true,
            data: addresses
        });
    } catch (error) {
        console.error('Get deposit addresses error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create a deposit record
const createDeposit = async (req, res) => {
    try {
        const { network, address, amount, transactionHash, status = 'pending' } = req.body;
        const userId = req.user.user_id;

        // Validate required fields
        if (!network || !address || !amount || !transactionHash) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Create deposit record
        const [result] = await db.pool.execute(
            `INSERT INTO deposits (user_id, network, address, amount, transaction_hash, status, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [userId, network, address, amount, transactionHash, status]
        );

        res.json({
            success: true,
            message: 'Deposit record created successfully',
            data: {
                deposit_id: result.insertId,
                user_id: userId,
                network,
                address,
                amount,
                transaction_hash: transactionHash,
                status
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

// Get user's deposit history
const getDepositHistory = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { page = 1, limit = 10, status } = req.query;

        let query = 'SELECT * FROM deposits WHERE user_id = ?';
        let params = [userId];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const [deposits] = await db.pool.execute(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM deposits WHERE user_id = ?';
        let countParams = [userId];

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        const [countResult] = await db.pool.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: {
                deposits,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get deposit history error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update deposit status (for admin or automated systems)
const updateDepositStatus = async (req, res) => {
    try {
        const { depositId, status, transactionHash } = req.body;

        if (!depositId || !status) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Update deposit status
        const [result] = await db.pool.execute(
            'UPDATE deposits SET status = ?, updated_at = NOW() WHERE deposit_id = ?',
            [status, depositId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Deposit not found'
            });
        }

        // If deposit is confirmed, update user balance
        if (status === 'confirmed') {
            const [deposit] = await db.pool.execute(
                'SELECT user_id, amount FROM deposits WHERE deposit_id = ?',
                [depositId]
            );

            if (deposit.length > 0) {
                const { user_id, amount } = deposit[0];
                
                // Update user account balance
                await db.pool.execute(
                    'UPDATE users SET account_balance = account_balance + ?, updated_at = NOW() WHERE user_id = ?',
                    [amount, user_id]
                );

                // Create transaction record
                await db.pool.execute(
                    `INSERT INTO transactions (user_id, type, amount, description, created_at, updated_at) 
                     VALUES (?, 'deposit', ?, 'USDT Deposit via ${deposit[0].network}', NOW(), NOW())`,
                    [user_id, amount]
                );
            }
        }

        res.json({
            success: true,
            message: 'Deposit status updated successfully'
        });
    } catch (error) {
        console.error('Update deposit status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getDepositAddresses,
    createDeposit,
    getDepositHistory,
    updateDepositStatus
};