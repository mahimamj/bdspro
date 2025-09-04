const express = require('express');
const passport = require('./config/passport');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'demo_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Test Google OAuth endpoint
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Test Google OAuth callback
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        console.log('Google OAuth successful!');
        console.log('User:', req.user);
        
        // Generate JWT token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { 
                user_id: req.user.user_id, 
                email: req.user.email 
            },
            process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development',
            { expiresIn: '24h' }
        );

        // Redirect to frontend with token
        const frontendUrl = 'http://localhost:3000';
        res.redirect(`${frontendUrl}/dashboard?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    }
);

// Test login page
app.get('/login', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>Test Google OAuth</h1>
                <a href="/auth/google">Login with Google</a>
            </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log(`Test Google OAuth: http://localhost:${PORT}/auth/google`);
});
