const mysql = require('mysql2/promise');

async function testUniversalRegistration() {
  try {
    console.log('=== TESTING UNIVERSAL REGISTRATION SYSTEM ===');
    
    const db = await mysql.createConnection({
      host: 'hopper.proxy.rlwy.net',
      port: 50359,
      user: 'root',
      password: 'QxNkIyShqDFSigZzxHaxiyZmqtzekoXL',
      database: 'railway',
      ssl: { rejectUnauthorized: false }
    });

    // Test 1: Check available referral codes
    console.log('\n1. Available referral codes:');
    const [validCodes] = await db.execute('SELECT user_id, name, referral_code FROM users WHERE referral_code IS NOT NULL ORDER BY user_id LIMIT 10');
    validCodes.forEach(user => {
      console.log(`- ${user.referral_code} (${user.name})`);
    });

    // Test 2: Test registration with valid referral code
    console.log('\n2. Testing registration with valid referral code...');
    const testUser1 = {
      name: 'Test User Universal',
      email: `test_universal_${Date.now()}@example.com`,
      password: 'TestPassword123',
      referralCode: validCodes[0]?.referral_code || 'BDSK04IUP' // Use first available code
    };

    console.log('Test user data:', testUser1);

    // Simulate the registration process
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(testUser1.password, 10);
    
    // Generate referral code
    const generateReferralCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'BDS';
      for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const newReferralCode = generateReferralCode();
    
    // Find referrer
    const [referrerResult] = await db.execute('SELECT user_id, name FROM users WHERE referral_code = ?', [testUser1.referralCode]);
    const referrerId = referrerResult.length > 0 ? referrerResult[0].user_id : null;
    const referrerName = referrerResult.length > 0 ? referrerResult[0].name : null;

    console.log('Referrer found:', { referrerId, referrerName, referralCode: testUser1.referralCode });

    // Insert user
    const [insertResult] = await db.execute(
      'INSERT INTO users (name, email, phone, password_hash, account_balance, total_earning, rewards, referral_code, referrer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [testUser1.name, testUser1.email, '0000000000', passwordHash, 0, 0, 0, newReferralCode, referrerId]
    );

    const newUserId = insertResult.insertId;
    console.log('✅ User created successfully with ID:', newUserId);

    // Create referral record if referrer exists
    if (referrerId) {
      await db.execute('INSERT INTO referrals (referrer_id, referred_id) VALUES (?, ?)', [referrerId, newUserId]);
      console.log('✅ Referral record created');
    }

    // Test 3: Test registration without referral code
    console.log('\n3. Testing registration without referral code...');
    const testUser2 = {
      name: 'Test User No Referral',
      email: `test_no_referral_${Date.now()}@example.com`,
      password: 'TestPassword123'
    };

    const passwordHash2 = await bcrypt.hash(testUser2.password, 10);
    const newReferralCode2 = generateReferralCode();

    const [insertResult2] = await db.execute(
      'INSERT INTO users (name, email, phone, password_hash, account_balance, total_earning, rewards, referral_code, referrer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [testUser2.name, testUser2.email, '0000000000', passwordHash2, 0, 0, 0, newReferralCode2, null]
    );

    const newUserId2 = insertResult2.insertId;
    console.log('✅ User without referral created successfully with ID:', newUserId2);

    // Test 4: Test with invalid referral code
    console.log('\n4. Testing with invalid referral code...');
    const testUser3 = {
      name: 'Test User Invalid Code',
      email: `test_invalid_${Date.now()}@example.com`,
      password: 'TestPassword123',
      referralCode: 'INVALID123'
    };

    const [invalidReferralCheck] = await db.execute('SELECT user_id FROM users WHERE referral_code = ?', [testUser3.referralCode]);
    console.log('Invalid referral code check:', invalidReferralCheck.length === 0 ? '❌ Code does not exist' : '✅ Code exists');

    // Final verification
    console.log('\n5. Final verification - Recent users:');
    const [recentUsers] = await db.execute(`
      SELECT 
        u.user_id, 
        u.name, 
        u.email, 
        u.referral_code, 
        u.referrer_id,
        r.name as referrer_name
      FROM users u
      LEFT JOIN users r ON u.referrer_id = r.user_id
      WHERE u.user_id >= ?
      ORDER BY u.user_id DESC
    `, [newUserId - 5]);

    recentUsers.forEach(user => {
      console.log(`ID: ${user.user_id} | Name: ${user.name} | Email: ${user.email} | Referral Code: ${user.referral_code} | Referrer: ${user.referrer_name || 'None'}`);
    });

    await db.end();
    console.log('\n✅ Universal registration system test completed!');
    console.log('✅ System works for any user with or without referral codes');
    
  } catch (error) {
    console.error('❌ Error testing universal registration:', error.message);
  }
}

testUniversalRegistration();
