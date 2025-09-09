const mysql = require('mysql2/promise');

async function fixExistingReferrals() {
  try {
    console.log('=== FIXING EXISTING REFERRAL RELATIONSHIPS ===');
    
    const db = await mysql.createConnection({
      host: 'hopper.proxy.rlwy.net',
      port: 50359,
      user: 'root',
      password: 'QxNkIyShqDFSigZzxHaxiyZmqtzekoXL',
      database: 'railway',
      ssl: { rejectUnauthorized: false }
    });

    // 1. Check current state
    console.log('\n1. Current state before fix:');
    const [beforeUsers] = await db.execute(`
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
    
    beforeUsers.forEach(user => {
      console.log(`ID: ${user.user_id} | Name: ${user.name} | Email: ${user.email} | Referral Code: ${user.referral_code} | Referrer ID: ${user.referrer_id} | Referrer Name: ${user.referrer_name || 'None'}`);
    });

    // 2. Find users who might have been referred but don't have referrer_id set
    console.log('\n2. Looking for users who might have been referred...');
    
    // This is tricky because we need to figure out who referred whom
    // For now, let's assume that if someone has a referral code, they might have been referred
    // We'll need to manually set the relationships based on your knowledge
    
    // Example: If you know that Kapil was referred by Mahima
    // Mahima's user_id is 7, Kapil's user_id is 648599
    
    console.log('\n3. Manual referral fixes (you can modify these):');
    
    // Fix Kapil's referrer_id to point to Mahima
    try {
      await db.execute(
        'UPDATE users SET referrer_id = ? WHERE user_id = ?',
        [7, 648599] // Mahima's ID, Kapil's ID
      );
      console.log('✅ Set Kapil (ID: 648599) referrer_id to Mahima (ID: 7)');
      
      // Create referral record
      await db.execute(
        'INSERT INTO referrals (referrer_id, referred_id) VALUES (?, ?)',
        [7, 648599]
      );
      console.log('✅ Created referral record for Kapil -> Mahima');
      
    } catch (error) {
      console.log('❌ Error fixing Kapil referral:', error.message);
    }

    // 3. Verify the fix
    console.log('\n4. State after fix:');
    const [afterUsers] = await db.execute(`
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
    
    afterUsers.forEach(user => {
      console.log(`ID: ${user.user_id} | Name: ${user.name} | Email: ${user.email} | Referral Code: ${user.referral_code} | Referrer ID: ${user.referrer_id} | Referrer Name: ${user.referrer_name || 'None'}`);
    });

    // 4. Check referrals table
    console.log('\n5. Referrals table:');
    const [referrals] = await db.execute(`
      SELECT 
        r.id,
        r.referrer_id,
        r.referred_id,
        u1.name as referrer_name,
        u2.name as referred_name
      FROM referrals r
      LEFT JOIN users u1 ON r.referrer_id = u1.user_id
      LEFT JOIN users u2 ON r.referred_id = u2.user_id
      ORDER BY r.id
    `);
    
    referrals.forEach(ref => {
      console.log(`Referral ID: ${ref.id} | Referrer: ${ref.referrer_name} (${ref.referrer_id}) | Referred: ${ref.referred_name} (${ref.referred_id})`);
    });

    await db.end();
    console.log('\n✅ Referral fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing referrals:', error.message);
  }
}

fixExistingReferrals();
