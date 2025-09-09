const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('./config/passport');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const transactionRoutes = require('./routes/transactions');
const paymentRoutes = require('./routes/payments');
const depositRoutes = require('./routes/deposits');
const reportRoutes = require('./routes/reports');
const investmentRoutes = require('./routes/investments');
const referralRoutes = require('./routes/referrals');
const { processGrowthManually, scheduleGrowthProcessing } = require('./services/growthProcessor');

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    }
});
app.use(limiter);

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'demo_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'BDS PRO API is running',
        timestamp: new Date().toISOString()
    });
});

// Growth processing endpoint (for manual testing)
app.post('/api/growth/process', processGrowthManually);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/referrals', referralRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        
        if (dbConnected) {
            console.log('💰 Payment system initialized with real database');
        } else {
            console.log('💰 Payment system running in temporary demo mode');
        }
        
        app.listen(PORT, () => {
            console.log(`🚀 BDS PRO API server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
            console.log(`💰 Payment system initialized with blockchain watcher`);
            console.log(`📊 Database: ${dbConnected ? 'Connected to MySQL (XAMPP)' : 'Demo mode (temporary)'}`);
            
            // Schedule growth processing (6% monthly growth)
            scheduleGrowthProcessing();
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
