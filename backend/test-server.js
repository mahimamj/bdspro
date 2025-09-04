console.log('Testing server startup...');

try {
    console.log('1. Loading dependencies...');
    const express = require('express');
    const cors = require('cors');
    const helmet = require('helmet');
    const rateLimit = require('express-rate-limit');
    const session = require('express-session');
    const passport = require('./config/passport');
    require('dotenv').config();
    
    console.log('2. Dependencies loaded successfully');
    
    console.log('3. Testing database connection...');
    const { testConnection } = require('./config/database');
    
    console.log('4. All imports successful');
    console.log('✅ Server should start without issues');
    
} catch (error) {
    console.error('❌ Error during startup:', error.message);
    console.error('Stack:', error.stack);
}
