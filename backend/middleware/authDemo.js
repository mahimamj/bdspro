const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development');
        
        // For demo mode, create a mock user object
        const mockUser = {
            user_id: decoded.user_id || 'demo_user_123',
            name: decoded.name || 'Demo User',
            email: decoded.email || 'demo@example.com',
            phone: decoded.phone || null,
            account_balance: decoded.account_balance || 1000.00,
            total_earning: decoded.total_earning || 500.00,
            rewards: decoded.rewards || 50.00
        };

        req.user = mockUser;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired' 
            });
        }
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
};

module.exports = {
    authenticateToken
};
