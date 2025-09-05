// Database helper for Vercel API routes
// This connects to the same MySQL database as the backend

const mysql = require('mysql2/promise');

// Parse DATABASE_URL for production (Vercel, Heroku, etc.)
let dbConfig;
if (process.env.DATABASE_URL) {
    // Production: Parse DATABASE_URL
    const url = new URL(process.env.DATABASE_URL);
    dbConfig = {
        host: url.hostname,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1),
        port: url.port || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: true,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
} else {
    // Development: Use individual environment variables
    dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'bds_pro_db',
        port: process.env.DB_PORT || 3307,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: true
    };
}

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database helper functions
const db = {
    // Test database connection
    async testConnection() {
        try {
            const connection = await pool.getConnection();
            console.log('✅ Database connected successfully');
            connection.release();
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    },

    // Find user by email
    async findUserByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            return null;
        }
    },

    // Find user by ID
    async findUserById(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE user_id = ?',
                [userId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            return null;
        }
    },

    // Create new user
    async createUser(userData) {
        try {
            const { name, email, password_hash, referral_code, referrer_id } = userData;
            
            const [result] = await pool.execute(
                'INSERT INTO users (name, email, password_hash, referral_code, referrer_id) VALUES (?, ?, ?, ?, ?)',
                [name, email, password_hash, referral_code, referrer_id]
            );
            
            return {
                success: true,
                user_id: result.insertId,
                message: 'User created successfully'
            };
        } catch (error) {
            console.error('Error creating user:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Create Google OAuth user
    async createGoogleUser(userData) {
        try {
            const { name, email, google_id } = userData;
            
            // Generate referral code
            const referral_code = 'GOOGLE_' + Math.random().toString(36).substr(2, 8).toUpperCase();
            
            const [result] = await pool.execute(
                'INSERT INTO users (name, email, password_hash, referral_code, google_id) VALUES (?, ?, ?, ?, ?)',
                [name, email, 'google_oauth_user', referral_code, google_id]
            );
            
            return {
                success: true,
                user_id: result.insertId,
                referral_code,
                message: 'Google user created successfully'
            };
        } catch (error) {
            console.error('Error creating Google user:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Update user
    async updateUser(userId, updateData) {
        try {
            const fields = Object.keys(updateData);
            const values = Object.values(updateData);
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            
            const [result] = await pool.execute(
                `UPDATE users SET ${setClause} WHERE user_id = ?`,
                [...values, userId]
            );
            
            return {
                success: true,
                affectedRows: result.affectedRows,
                message: 'User updated successfully'
            };
        } catch (error) {
            console.error('Error updating user:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

module.exports = { db, pool };
