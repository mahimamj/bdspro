const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { pool } = require('./database');

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        // For demo purposes, return a mock user
        const mockUser = {
            user_id: id,
            name: 'Google User',
            email: 'user@example.com',
            phone: null,
            account_balance: 1000.00,
            total_earning: 500.00,
            rewards: 50.00
        };
        done(null, mockUser);
    } catch (error) {
        done(error, null);
    }
});

// JWT Strategy
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development'
}, async (payload, done) => {
    try {
        const [users] = await pool.execute(
            'SELECT user_id, name, email, phone, account_balance, total_earning, rewards FROM users WHERE user_id = ?',
            [payload.user_id]
        );

        if (users.length > 0) {
            return done(null, users[0]);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '1006537965891-u4n0qc6fmpoo1k80vv6kd7860vj85nmc.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5001/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // For demo purposes, create a mock user without database
        const mockUser = {
            user_id: 1,
            name: profile.displayName || 'Google User',
            email: profile.emails[0].value,
            phone: profile.phoneNumbers ? profile.phoneNumbers[0].value : null,
            account_balance: 1000.00,
            total_earning: 500.00,
            rewards: 50.00
        };

        console.log('Google OAuth successful for:', profile.emails[0].value);
        return done(null, mockUser);
        
        // TODO: Uncomment below when database is properly configured
        /*
        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT user_id, name, email, phone, account_balance, total_earning, rewards FROM users WHERE email = ?',
            [profile.emails[0].value]
        );

        if (existingUsers.length > 0) {
            // User exists, return user data
            return done(null, existingUsers[0]);
        } else {
            // Create new user
            const [result] = await pool.execute(
                'INSERT INTO users (name, email, phone, password_hash, account_balance, total_earning, rewards) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    profile.displayName,
                    profile.emails[0].value,
                    profile.phoneNumbers ? profile.phoneNumbers[0].value : null,
                    'google_oauth', // No password for OAuth users
                    0.00,
                    0.00,
                    0.00
                ]
            );

            const newUser = {
                user_id: result.insertId,
                name: profile.displayName,
                email: profile.emails[0].value,
                phone: profile.phoneNumbers ? profile.phoneNumbers[0].value : null,
                account_balance: 0.00,
                total_earning: 0.00,
                rewards: 0.00
            };

            // Initialize network record
            await pool.execute(
                'INSERT INTO network (user_id) VALUES (?)',
                [result.insertId]
            );

            // Create initial transaction record
            await pool.execute(
                'INSERT INTO transactions (user_id, type, amount, credit, debit, balance, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [result.insertId, 'deposit', 0, 0, 0, 0, 'Account created via Google OAuth', 'completed']
            );

            return done(null, newUser);
        }
        */
    } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
    }
}));

module.exports = passport;
