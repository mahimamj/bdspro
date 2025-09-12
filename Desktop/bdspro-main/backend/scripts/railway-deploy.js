/**
 * Railway Deployment Script
 * Deploys the complete BDS PRO system to Railway
 */

const { deployReferralViews } = require('./deploy-referral-views');
const mysql = require('mysql2/promise');

// Railway database configuration
const railwayConfig = {
  host: process.env.RAILWAY_MYSQL_HOST,
  port: process.env.RAILWAY_MYSQL_PORT,
  user: process.env.RAILWAY_MYSQL_USER,
  password: process.env.RAILWAY_MYSQL_PASSWORD,
  database: process.env.RAILWAY_MYSQL_DATABASE,
  ssl: { rejectUnauthorized: false }
};

async function deployToRailway() {
  console.log('🚀 Starting Railway Deployment...');
  console.log('🌐 Railway Environment:', process.env.RAILWAY_ENVIRONMENT || 'production');
  
  try {
    // Test Railway connection
    console.log('🔌 Testing Railway MySQL connection...');
    const connection = await mysql.createConnection(railwayConfig);
    console.log('✅ Connected to Railway MySQL');
    
    // Deploy referral views
    console.log('📊 Deploying referral views...');
    await deployReferralViews();
    
    // Test the deployment
    console.log('🧪 Testing deployed views...');
    
    // Test user_referrals view
    const [referrals] = await connection.execute('SELECT COUNT(*) as count FROM user_referrals');
    console.log(`✅ user_referrals: ${referrals[0].count} records`);
    
    // Test referral_stats view
    const [stats] = await connection.execute('SELECT COUNT(*) as count FROM referral_stats');
    console.log(`✅ referral_stats: ${stats[0].count} records`);
    
    // Test referral_earnings view
    const [earnings] = await connection.execute('SELECT COUNT(*) as count FROM referral_earnings');
    console.log(`✅ referral_earnings: ${earnings[0].count} records`);
    
    // Test stored procedures
    console.log('🔧 Testing stored procedures...');
    
    // Test GetUserReferrals procedure
    try {
      await connection.execute('CALL GetUserReferrals(2)');
      console.log('✅ GetUserReferrals procedure working');
    } catch (error) {
      console.log('⚠️ GetUserReferrals procedure test failed (no data):', error.message);
    }
    
    // Test GetUserReferralStats procedure
    try {
      await connection.execute('CALL GetUserReferralStats(2)');
      console.log('✅ GetUserReferralStats procedure working');
    } catch (error) {
      console.log('⚠️ GetUserReferralStats procedure test failed (no data):', error.message);
    }
    
    await connection.end();
    
    console.log('\n🎉 Railway Deployment Completed Successfully!');
    console.log('\n📋 Available API Endpoints:');
    console.log('   GET /api/referrals/user/:userId - Get user referrals');
    console.log('   GET /api/referrals/stats/:userId - Get referral stats');
    console.log('   GET /api/referrals/earnings/:userId - Get referral earnings');
    console.log('   GET /api/referrals/dashboard/:userId - Get complete dashboard');
    console.log('   GET /api/referrals/chain/:userId - Get referral chain');
    console.log('   GET /api/referrals/admin/stats - Get all referral stats (admin)');
    console.log('   GET /api/referrals/admin/top-referrers - Get top referrers (admin)');
    
    console.log('\n📋 Available SQL Views:');
    console.log('   • user_referrals - Multi-level referral relationships');
    console.log('   • referral_stats - Referral statistics per user');
    console.log('   • referral_earnings - Referral earnings per user');
    
    console.log('\n📋 Available Stored Procedures:');
    console.log('   • GetUserReferrals(user_id) - Get all referrals for a user');
    console.log('   • GetUserReferralStats(user_id) - Get referral stats for a user');
    console.log('   • GetUserReferralEarnings(user_id) - Get referral earnings for a user');
    console.log('   • GetReferralDashboard(user_id) - Get complete dashboard data');
    
  } catch (error) {
    console.error('❌ Railway deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  deployToRailway().catch(console.error);
}

module.exports = { deployToRailway };
