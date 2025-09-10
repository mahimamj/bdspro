const mysql = require('mysql2/promise');

async function fixDuplicateReferralCodes() {
  try {
    console.log('=== FIXING DUPLICATE REFERRAL CODES ===');
    
    const db = await mysql.createConnection({
      host: 'hopper.proxy.rlwy.net',
      port: 50359,
      user: 'root',
      password: 'QxNkIyShqDFSigZzxHaxiyZmqtzekoXL',
      database: 'railway',
      ssl: { rejectUnauthorized: false }
    });

    // First, check current state
    console.log('\n1. Current referral codes:');
    const [currentUsers] = await db.execute('SELECT user_id, name, email, referral_code FROM users ORDER BY user_id');
    currentUsers.forEach(user => {
      console.log(`ID: ${user.user_id} | Name: ${user.name} | Code: ${user.referral_code}`);
    });

    // Check for duplicates
    const [duplicates] = await db.execute('SELECT referral_code, COUNT(*) as count FROM users WHERE referral_code IS NOT NULL GROUP BY referral_code HAVING COUNT(*) > 1');
    console.log('\n2. Duplicate codes found:', duplicates);

    // Generate unique referral codes
    const generateUniqueReferralCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'BDS';
      for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    console.log('\n3. Generating unique referral codes...');
    
    const usedCodes = new Set();
    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of currentUsers) {
      let newCode = user.referral_code;
      let needsUpdate = false;

      // Check if code is null, empty, or duplicate
      if (!newCode || newCode.trim() === '' || usedCodes.has(newCode)) {
        needsUpdate = true;
      }

      if (needsUpdate) {
        // Generate new unique code
        do {
          newCode = generateUniqueReferralCode();
        } while (usedCodes.has(newCode));

        await db.execute('UPDATE users SET referral_code = ? WHERE user_id = ?', [newCode, user.user_id]);
        console.log(`✅ Updated ${user.name} (ID: ${user.user_id}) with new code: ${newCode}`);
        updatedCount++;
      } else {
        console.log(`✓ ${user.name} (ID: ${user.user_id}) already has unique code: ${newCode}`);
        skippedCount++;
      }

      usedCodes.add(newCode);
    }

    // Update referral_links table with new codes
    console.log('\n4. Updating referral_links table...');
    const baseUrl = 'https://bdspro-fawn.vercel.app';
    let linksUpdated = 0;

    for (const user of currentUsers) {
      const referralLink = `${baseUrl}/signup?ref=${user.referral_code}`;
      
      try {
        await db.execute(`
          INSERT INTO referral_links (user_id, referral_code, referral_link) 
          VALUES (?, ?, ?) 
          ON DUPLICATE KEY UPDATE 
          referral_code = VALUES(referral_code),
          referral_link = VALUES(referral_link),
          updated_at = CURRENT_TIMESTAMP
        `, [user.user_id, user.referral_code, referralLink]);
        
        linksUpdated++;
      } catch (error) {
        console.error(`Error updating link for user ${user.user_id}:`, error.message);
      }
    }

    // Final verification
    console.log('\n5. Final verification:');
    const [finalUsers] = await db.execute('SELECT user_id, name, referral_code FROM users ORDER BY user_id');
    finalUsers.forEach(user => {
      const referralLink = `${baseUrl}/signup?ref=${user.referral_code}`;
      console.log(`ID: ${user.user_id} | Name: ${user.name} | Code: ${user.referral_code} | Link: ${referralLink}`);
    });

    // Check for remaining duplicates
    const [finalDuplicates] = await db.execute('SELECT referral_code, COUNT(*) as count FROM users WHERE referral_code IS NOT NULL GROUP BY referral_code HAVING COUNT(*) > 1');
    console.log('\n6. Remaining duplicates:', finalDuplicates.length === 0 ? 'None ✅' : finalDuplicates);

    await db.end();
    
    console.log('\n✅ Referral code fix completed!');
    console.log(`✅ Updated: ${updatedCount} users`);
    console.log(`✅ Skipped: ${skippedCount} users (already unique)`);
    console.log(`✅ Links updated: ${linksUpdated}`);
    console.log(`✅ Total unique codes: ${usedCodes.size}`);
    console.log('\nVisit: https://bdspro-fawn.vercel.app/referral-links to see all unique links');
    
  } catch (error) {
    console.error('❌ Error fixing referral codes:', error.message);
  }
}

fixDuplicateReferralCodes();
