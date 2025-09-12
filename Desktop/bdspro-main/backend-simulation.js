// Backend Simulation for BDS PRO Dashboard
// This file demonstrates how the frontend would integrate with a real backend API

// Simulated database
const users = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 98765 43210',
        password: 'hashed_password_here',
        referralCode: 'JOHN123',
        referredBy: null,
        level: 1,
        joinDate: '2024-01-15T10:30:00Z'
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+91 98765 43211',
        password: 'hashed_password_here',
        referralCode: 'JANE456',
        referredBy: 'JOHN123',
        level: 2,
        joinDate: '2024-01-20T14:20:00Z'
    }
];

const dashboardData = {
    1: {
        accountBalance: 1250.50,
        totalEarnings: 345.75,
        level1Income: 120.25,
        level2Income: 45.50,
        rewards: 180.00,
        level1Business: 2500.00,
        level2Business: 1200.00,
        totalReferrals: 8,
        level1Referrals: 5,
        level2Referrals: 3,
        totalReferralEarnings: 165.75,
        pendingWithdrawals: 2,
        totalWithdrawn: 500.00
    },
    2: {
        accountBalance: 850.25,
        totalEarnings: 225.50,
        level1Income: 85.75,
        level2Income: 25.25,
        rewards: 114.50,
        level1Business: 1500.00,
        level2Business: 800.00,
        totalReferrals: 3,
        level1Referrals: 2,
        level2Referrals: 1,
        totalReferralEarnings: 75.25,
        pendingWithdrawals: 1,
        totalWithdrawn: 250.00
    }
};

const transactions = {
    1: [
        {
            id: 1,
            userId: 1,
            type: 'deposit',
            amount: 1000.00,
            status: 'completed',
            method: 'USDT (TRC20)',
            details: 'Initial deposit',
            date: '2024-01-15T10:30:00Z',
            transactionId: 'TX001'
        },
        {
            id: 2,
            userId: 1,
            type: 'earning',
            amount: 120.25,
            status: 'completed',
            method: 'Level 1 Referral',
            details: 'Referral commission from John Doe',
            date: '2024-01-20T14:20:00Z',
            transactionId: 'TX002'
        }
    ],
    2: [
        {
            id: 3,
            userId: 2,
            type: 'deposit',
            amount: 500.00,
            status: 'completed',
            method: 'Bank Transfer',
            details: 'Initial deposit',
            date: '2024-01-20T14:20:00Z',
            transactionId: 'TX003'
        }
    ]
};

const withdrawals = {
    1: [
        {
            id: 1,
            userId: 1,
            amount: 200.00,
            address: 'TRC20_ADDRESS_HERE',
            status: 'pending',
            date: '2024-01-25T09:15:00Z',
            transactionId: 'WTH001'
        }
    ],
    2: []
};

const referrals = {
    1: [
        {
            id: 1,
            referrerId: 1,
            referredId: 2,
            level: 1,
            status: 'active',
            joinDate: '2024-01-20T14:20:00Z',
            earnings: 120.25
        }
    ],
    2: []
};

// JWT Secret (in real app, this would be in environment variables)
const JWT_SECRET = 'your-secret-key-here';

// Simulated API endpoints
class BDSPROAPI {
    constructor() {
        this.baseURL = 'https://api.bdspro.io/v1';
        this.token = null;
    }

    // Authentication
    async login(email, phone, password) {
        try {
            // Simulate API call delay
            await this.delay(1000);
            
            const user = users.find(u => 
                (u.email === email || u.phone === phone) && 
                u.password === password
            );
            
            if (!user) {
                throw new Error('Invalid credentials');
            }
            
            // Generate JWT token (simplified)
            const token = this.generateJWT(user);
            this.token = token;
            
            return {
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    referralCode: user.referralCode
                },
                token: token
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async signup(name, email, phone, password, referralCode = null) {
        try {
            await this.delay(1500);
            
            // Check if user already exists
            const existingUser = users.find(u => u.email === email || u.phone === phone);
            if (existingUser) {
                throw new Error('User already exists');
            }
            
            // Create new user
            const newUser = {
                id: users.length + 1,
                name,
                email,
                phone,
                password: this.hashPassword(password),
                referralCode: this.generateReferralCode(name),
                referredBy: referralCode,
                level: referralCode ? 2 : 1,
                joinDate: new Date().toISOString()
            };
            
            users.push(newUser);
            
            // Initialize dashboard data
            dashboardData[newUser.id] = {
                accountBalance: 0,
                totalEarnings: 0,
                level1Income: 0,
                level2Income: 0,
                rewards: 0,
                level1Business: 0,
                level2Business: 0,
                totalReferrals: 0,
                level1Referrals: 0,
                level2Referrals: 0,
                totalReferralEarnings: 0,
                pendingWithdrawals: 0,
                totalWithdrawn: 0
            };
            
            // Generate JWT token
            const token = this.generateJWT(newUser);
            this.token = token;
            
            return {
                success: true,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone,
                    referralCode: newUser.referralCode
                },
                token: token
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Dashboard data
    async getDashboardData(userId) {
        try {
            await this.delay(800);
            
            if (!this.token) {
                throw new Error('Authentication required');
            }
            
            const data = dashboardData[userId];
            if (!data) {
                throw new Error('User data not found');
            }
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Transactions
    async getTransactions(userId, type = 'all') {
        try {
            await this.delay(600);
            
            if (!this.token) {
                throw new Error('Authentication required');
            }
            
            let userTransactions = transactions[userId] || [];
            
            if (type !== 'all') {
                userTransactions = userTransactions.filter(t => t.type === type);
            }
            
            return {
                success: true,
                transactions: userTransactions
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async createDeposit(userId, amount, method, note = '') {
        try {
            await this.delay(1200);
            
            if (!this.token) {
                throw new Error('Authentication required');
            }
            
            if (amount < 50) {
                throw new Error('Minimum deposit amount is 50 USDT');
            }
            
            const transaction = {
                id: Date.now(),
                userId: userId,
                type: 'deposit',
                amount: amount,
                status: 'pending',
                method: method,
                details: note || `Deposit via ${method}`,
                date: new Date().toISOString(),
                transactionId: `TX${Date.now()}`
            };
            
            if (!transactions[userId]) {
                transactions[userId] = [];
            }
            transactions[userId].push(transaction);
            
            // Update dashboard data
            dashboardData[userId].accountBalance += amount;
            
            return {
                success: true,
                transaction: transaction
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async createWithdrawal(userId, amount, address, note = '') {
        try {
            await this.delay(1200);
            
            if (!this.token) {
                throw new Error('Authentication required');
            }
            
            if (amount < 10) {
                throw new Error('Minimum withdrawal amount is 10 USDT');
            }
            
            if (amount > dashboardData[userId].accountBalance) {
                throw new Error('Insufficient balance');
            }
            
            const withdrawal = {
                id: Date.now(),
                userId: userId,
                amount: amount,
                address: address,
                status: 'pending',
                date: new Date().toISOString(),
                transactionId: `WTH${Date.now()}`,
                note: note
            };
            
            if (!withdrawals[userId]) {
                withdrawals[userId] = [];
            }
            withdrawals[userId].push(withdrawal);
            
            // Update dashboard data
            dashboardData[userId].accountBalance -= amount;
            dashboardData[userId].pendingWithdrawals += 1;
            
            // Add to transactions
            const transaction = {
                id: Date.now() + 1,
                userId: userId,
                type: 'withdraw',
                amount: amount,
                status: 'pending',
                method: 'USDT (TRC20)',
                details: `Withdrawal to ${address.substring(0, 10)}...${note ? ` - ${note}` : ''}`,
                date: new Date().toISOString(),
                transactionId: withdrawal.transactionId
            };
            
            if (!transactions[userId]) {
                transactions[userId] = [];
            }
            transactions[userId].push(transaction);
            
            return {
                success: true,
                withdrawal: withdrawal
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Referrals
    async getReferrals(userId) {
        try {
            await this.delay(600);
            
            if (!this.token) {
                throw new Error('Authentication required');
            }
            
            const userReferrals = referrals[userId] || [];
            const referralDetails = userReferrals.map(ref => {
                const referredUser = users.find(u => u.id === ref.referredId);
                return {
                    ...ref,
                    name: referredUser.name,
                    email: referredUser.email,
                    joinDate: referredUser.joinDate
                };
            });
            
            return {
                success: true,
                referrals: referralDetails
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getWithdrawals(userId) {
        try {
            await this.delay(600);
            
            if (!this.token) {
                throw new Error('Authentication required');
            }
            
            const userWithdrawals = withdrawals[userId] || [];
            
            return {
                success: true,
                withdrawals: userWithdrawals
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Utility functions
    generateJWT(user) {
        // Simplified JWT generation
        const payload = {
            userId: user.id,
            email: user.email,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };
        
        return btoa(JSON.stringify(payload)); // Base64 encoded (simplified)
    }

    hashPassword(password) {
        // Simplified password hashing
        return btoa(password + JWT_SECRET);
    }

    generateReferralCode(name) {
        const prefix = name.substring(0, 4).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return prefix + random;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
    }

    // Clear authentication
    logout() {
        this.token = null;
    }
}

// Export for use in frontend
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BDSPROAPI;
} else {
    window.BDSPROAPI = BDSPROAPI;
}

// Example usage:
/*
const api = new BDSPROAPI();

// Login
api.login('john@example.com', '+91 98765 43210', 'password123')
    .then(response => {
        if (response.success) {
            console.log('Login successful:', response.user);
            api.setToken(response.token);
        } else {
            console.error('Login failed:', response.error);
        }
    });

// Get dashboard data
api.getDashboardData(1)
    .then(response => {
        if (response.success) {
            console.log('Dashboard data:', response.data);
        } else {
            console.error('Failed to get dashboard data:', response.error);
        }
    });
*/
