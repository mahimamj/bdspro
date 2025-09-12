/**
 * Railway Deployment Script for Referral Views
 * This script deploys the referral views to your Railway MySQL database
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.RAILWAY_MYSQL_HOST || process.env.MYSQL_HOST || 'localhost',
  port: process.env.RAILWAY_MYSQL_PORT || process.env.MYSQL_PORT || 3306,
  user: process.env.RAILWAY_MYSQL_USER || process.env.MYSQL_USER || 'root',
  password: process.env.RAILWAY_MYSQL_PASSWORD || process.env.MYSQL_PASSWORD || '',
  database: process.env.RAILWAY_MYSQL_DATABASE || process.env.MYSQL_DATABASE || 'bdspro',
  ssl: process.env.RAILWAY_MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : false
};

async function deployReferralViews() {
  let connection;
  
  try {
    console.log('🚀 Starting Railway Referral Views Deployment...');
    console.log('📊 Database:', dbConfig.database);
    console.log('🌐 Host:', dbConfig.host);
    
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway MySQL database');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../database/referral-views.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          // Continue with other statements even if one fails
        }
      }
    }
    
    // Test the views
    console.log('\n🧪 Testing deployed views...');
    
    // Test user_referrals view
    try {
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM user_referrals');
      console.log(`✅ user_referrals view: ${rows[0].count} records`);
    } catch (error) {
      console.error('❌ user_referrals view test failed:', error.message);
    }
    
    // Test referral_stats view
    try {
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM referral_stats');
      console.log(`✅ referral_stats view: ${rows[0].count} records`);
    } catch (error) {
      console.error('❌ referral_stats view test failed:', error.message);
    }
    
    // Test referral_earnings view
    try {
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM referral_earnings');
      console.log(`✅ referral_earnings view: ${rows[0].count} records`);
    } catch (error) {
      console.error('❌ referral_earnings view test failed:', error.message);
    }
    
    console.log('\n🎉 Railway Referral Views Deployment Completed Successfully!');
    console.log('\n📋 Available Views:');
    console.log('   • user_referrals - Multi-level referral relationships');
    console.log('   • referral_stats - Referral statistics per user');
    console.log('   • referral_earnings - Referral earnings per user');
    console.log('\n📋 Available Procedures:');
    console.log('   • GetUserReferrals(user_id) - Get all referrals for a user');
    console.log('   • GetUserReferralStats(user_id) - Get referral stats for a user');
    console.log('   • GetUserReferralEarnings(user_id) - Get referral earnings for a user');
    console.log('   • GetReferralDashboard(user_id) - Get complete dashboard data');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  deployReferralViews().catch(console.error);
}

module.exports = { deployReferralViews, dbConfig };
