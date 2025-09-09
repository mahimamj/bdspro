const mysql = require('mysql2/promise');

async function testReferralSystem() {
  try {
    console.log('=== TESTING REFERRAL SYSTEM ===');
    
    const db = await mysql.createConnection({
      host: 'hopper.proxy.rlwy.net',
      port: 50359,
      user: 'root',
      password: 'QxNkIyShqDFSigZzxHaxiyZmqtzekoXL',
      database: 'railway',
      ssl: { rejectUnauthorized: false }
    });

    // 1. Check current users and their referral status
    console.log('\n1. Current users and referral status:');
    const [users] = await db.execute(`
      SELECT 
        u.user_id, 
        u.name, 
        u.email, 
        u.referral_code, 
        u.referrer_id,
        r.name as referrer_name
      FROM users u
      LEFT JOIN users r ON u.referrer_id = r.user_id
      ORDER BY u.user_id
    `);
    
    users.forEach(user => {
      console.log(`ID: ${user.user_id} | Name: ${user.name} | Email: ${user.email} | Referral Code: ${user.referral_code} | Referrer ID: ${user.referrer_id} | Referrer Name: ${user.referrer_name || 'None'}`);
    });

    // 2. Test creating a new user with referral code
    console.log('\n2. Testing new user registration with referral code...');
    
    // Find a user with a referral code to use as referrer
    const [referrers] = await db.execute('SELECT user_id, name, referral_code FROM users WHERE referral_code IS NOT NULL LIMIT 1');
    
    if (referrers.length > 0) {
      const referrer = referrers[0];
      console.log(`Using referrer: ${referrer.name} (${referrer.referral_code})`);
      
      // Simulate registration with referral code
      const testUser = {
        name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        phone: '1234567890',
        password: 'testpassword123',
        referralCode: referrer.referral_code
      };
      
      console.log('Test user data:', testUser);
      
      // This would normally be done through the API, but we'll simulate it
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(testUser.password, 10);
      
      // Generate referral code for new user
      const generateReferralCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'BDS';
        for (let i = 0; i < 7; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };
      
      const newReferralCode = generateReferralCode();
      
      // Insert test user
      const [insertResult] = await db.execute(
        'INSERT INTO users (name, email, phone, password_hash, account_balance, total_earning, rewards, referral_code, referrer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [testUser.name, testUser.email, testUser.phone, passwordHash, 0, 0, 0, newReferralCode, referrer.user_id]
      );
      
      const newUserId = insertResult.insertId;
      console.log(`✅ Test user created with ID: ${newUserId}`);
      
      // Verify the referral was set correctly
      const [verifyUser] = await db.execute(
        'SELECT user_id, name, email, referral_code, referrer_id FROM users WHERE user_id = ?',
        [newUserId]
      );
      
      console.log('✅ Verification - New user details:', verifyUser[0]);
      
      // Create referral record (without status column)
      await db.execute(
        'INSERT INTO referrals (referrer_id, referred_id) VALUES (?, ?)',
        [referrer.user_id, newUserId]
      );
      
      console.log('✅ Referral record created');
      
    } else {
      console.log('❌ No users with referral codes found');
    }

    // 3. Final verification
    console.log('\n3. Final verification - All users:');
    const [finalUsers] = await db.execute(`
      SELECT 
        u.user_id, 
        u.name, 
        u.email, 
        u.referral_code, 
        u.referrer_id,
        r.name as referrer_name
      FROM users u
      LEFT JOIN users r ON u.referrer_id = r.user_id
      ORDER BY u.user_id
    `);
    
    finalUsers.forEach(user => {
      console.log(`ID: ${user.user_id} | Name: ${user.name} | Email: ${user.email} | Referral Code: ${user.referral_code} | Referrer ID: ${user.referrer_id} | Referrer Name: ${user.referrer_name || 'None'}`);
    });

    await db.end();
    console.log('\n✅ Referral system test completed!');
    
  } catch (error) {
    console.error('❌ Error testing referral system:', error.message);
  }
}

testReferralSystem();
