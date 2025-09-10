// Test referral registration system
const mysql = require('mysql2/promise');

async function testReferralSystem() {
  try {
    const db = await mysql.createConnection({
      host: 'hopper.proxy.rlwy.net',
      port: 50359,
      user: 'root',
      password: 'QxNkIyShqDFSigZzxHaxiyZmqtzekoXL',
      database: 'railway',
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('=== TESTING REFERRAL REGISTRATION SYSTEM ===');
    
    // 1. Check existing users and their referral codes
    console.log('\n1. Checking existing users...');
    const [users] = await db.execute(`
      SELECT user_id, name, email, referral_code, referrer_id 
      FROM users 
      ORDER BY user_id DESC 
      LIMIT 10
    `);
    
    console.log('Recent users:');
    users.forEach(user => {
      console.log(`- User ${user.user_id}: ${user.name} (${user.email})`);
      console.log(`  Referral Code: ${user.referral_code}`);
      console.log(`  Referrer ID: ${user.referrer_id || 'None'}`);
      console.log('');
    });
    
    // 2. Check referrals table
    console.log('2. Checking referrals table...');
    const [referrals] = await db.execute(`
      SELECT r.*, u1.name as referrer_name, u2.name as referred_name
      FROM referrals r
      LEFT JOIN users u1 ON r.referrer_id = u1.user_id
      LEFT JOIN users u2 ON r.referred_id = u2.user_id
      ORDER BY r.id DESC
      LIMIT 10
    `);
    
    console.log('Recent referrals:');
    referrals.forEach(ref => {
      console.log(`- Referral ${ref.id}: ${ref.referrer_name} (${ref.referrer_id}) → ${ref.referred_name} (${ref.referred_id})`);
    });
    
    // 3. Test referral link generation
    console.log('\n3. Testing referral link generation...');
    const baseUrl = 'https://bdspro-fawn.vercel.app';
    const testReferralCode = 'BDS123456';
    const referralLink = `${baseUrl}/signup?ref=${testReferralCode}`;
    console.log(`Generated referral link: ${referralLink}`);
    
    // 4. Check for any localhost references in database
    console.log('\n4. Checking for localhost references...');
    const [localhostCheck] = await db.execute(`
      SELECT user_id, name, email, referral_code 
      FROM users 
      WHERE referral_code LIKE '%localhost%' 
      OR email LIKE '%localhost%'
    `);
    
    if (localhostCheck.length > 0) {
      console.log('Found localhost references:');
      localhostCheck.forEach(user => {
        console.log(`- User ${user.user_id}: ${user.name} - ${user.email} - ${user.referral_code}`);
      });
    } else {
      console.log('No localhost references found in database');
    }
    
    // 5. Test creating a new user with referral
    console.log('\n5. Testing new user creation with referral...');
    
    // Find a user with a referral code to use as referrer
    const [referrerUsers] = await db.execute(`
      SELECT user_id, name, referral_code 
      FROM users 
      WHERE referral_code IS NOT NULL 
      AND referral_code != '' 
      LIMIT 1
    `);
    
    if (referrerUsers.length > 0) {
      const referrer = referrerUsers[0];
      console.log(`Using referrer: ${referrer.name} (${referrer.referral_code})`);
      
      // Simulate registration with referral code
      const testUser = {
        name: 'Test User ' + Date.now(),
        email: `test${Date.now()}@example.com`,
        phone: '1234567890',
        password: 'testpassword123',
        referralCode: referrer.referral_code
      };
      
      console.log('Test user data:', testUser);
      
      // This would normally be done through the API
      console.log('To test registration, use this referral link:');
      console.log(`${baseUrl}/signup?ref=${referrer.referral_code}`);
    } else {
      console.log('No users with referral codes found to test with');
    }
    
    await db.end();
    console.log('\n✅ Referral system test completed!');
    
  } catch (error) {
    console.error('❌ Error testing referral system:', error.message);
  }
}

testReferralSystem();
