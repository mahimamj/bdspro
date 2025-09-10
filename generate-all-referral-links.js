const mysql = require('mysql2/promise');

async function generateAllReferralLinks() {
  try {
    console.log('=== GENERATING REFERRAL LINKS FOR ALL USERS ===');
    
    const db = await mysql.createConnection({
      host: 'hopper.proxy.rlwy.net',
      port: 50359,
      user: 'root',
      password: 'QxNkIyShqDFSigZzxHaxiyZmqtzekoXL',
      database: 'railway',
      ssl: { rejectUnauthorized: false }
    });

    // Create referral_links table
    console.log('Creating referral_links table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS referral_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        referral_code VARCHAR(50) NOT NULL,
        referral_link VARCHAR(500) NOT NULL,
        clicks INT DEFAULT 0,
        signups INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_link (user_id),
        UNIQUE KEY unique_referral_code (referral_code)
      )
    `);
    console.log('✅ Referral links table created/verified');

    // Get all users with referral codes
    const [users] = await db.execute('SELECT user_id, name, email, referral_code FROM users WHERE referral_code IS NOT NULL ORDER BY user_id');
    console.log(`Found ${users.length} users with referral codes`);

    const baseUrl = 'https://bdspro-fawn.vercel.app';
    let generatedCount = 0;
    let updatedCount = 0;

    for (const user of users) {
      const referralLink = `${baseUrl}/signup?ref=${user.referral_code}`;
      
      try {
        // Check if link already exists
        const [existing] = await db.execute('SELECT id FROM referral_links WHERE user_id = ?', [user.user_id]);
        
        if (existing.length > 0) {
          // Update existing link
          await db.execute(`
            UPDATE referral_links 
            SET referral_code = ?, referral_link = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = ?
          `, [user.referral_code, referralLink, user.user_id]);
          updatedCount++;
          console.log(`🔄 Updated link for ${user.name} (${user.email})`);
        } else {
          // Insert new link
          await db.execute(`
            INSERT INTO referral_links (user_id, referral_code, referral_link) 
            VALUES (?, ?, ?)
          `, [user.user_id, user.referral_code, referralLink]);
          generatedCount++;
          console.log(`✅ Generated link for ${user.name} (${user.email})`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing user ${user.name}:`, error.message);
      }
    }

    // Show all generated links
    console.log('\n=== ALL REFERRAL LINKS ===');
    const [allLinks] = await db.execute(`
      SELECT 
        rl.user_id,
        u.name,
        u.email,
        rl.referral_code,
        rl.referral_link,
        rl.clicks,
        rl.signups,
        rl.created_at
      FROM referral_links rl
      LEFT JOIN users u ON rl.user_id = u.user_id
      ORDER BY rl.user_id
    `);

    allLinks.forEach(link => {
      console.log(`ID: ${link.user_id} | Name: ${link.name} | Email: ${link.email}`);
      console.log(`  Code: ${link.referral_code}`);
      console.log(`  Link: ${link.referral_link}`);
      console.log(`  Clicks: ${link.clicks} | Signups: ${link.signups}`);
      console.log(`  Created: ${link.created_at}`);
      console.log('---');
    });

    await db.end();
    
    console.log('\n✅ Referral link generation completed!');
    console.log(`✅ Generated: ${generatedCount} new links`);
    console.log(`✅ Updated: ${updatedCount} existing links`);
    console.log(`✅ Total links: ${allLinks.length}`);
    console.log('\nVisit: https://bdspro-fawn.vercel.app/referral-links to see all links');
    
  } catch (error) {
    console.error('❌ Error generating referral links:', error.message);
  }
}

generateAllReferralLinks();
