import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GET ALL USER REFERRAL LINKS API START ===');
    
    // Get database connection
    const db = mysql.createPool({
      host: process.env.MYSQL_HOST || "hopper.proxy.rlwy.net",
      port: Number(process.env.MYSQL_PORT) || 50359,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "QxNkIyShqDFSigZzxHaxiyZmqtzekoXL",
      database: process.env.MYSQL_DATABASE || "railway",
      ssl: {
        rejectUnauthorized: false
      },
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0
    });

    // Get all users with their referral links
    const [users] = await db.execute(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.referral_code,
        rl.referral_link,
        rl.clicks,
        rl.signups,
        rl.created_at as link_created_at
      FROM users u
      LEFT JOIN referral_links rl ON u.user_id = rl.user_id
      ORDER BY u.user_id
    `) as any;

    // Generate referral links for users who don't have them
    const baseUrl = 'https://bdspro-fawn.vercel.app';
    const usersWithLinks = users.map((user: any) => {
      const referralLink = user.referral_link || `${baseUrl}/signup?ref=${user.referral_code}`;
      return {
        id: user.user_id,
        name: user.name,
        email: user.email,
        referralCode: user.referral_code,
        referralLink,
        clicks: user.clicks || 0,
        signups: user.signups || 0,
        linkCreatedAt: user.link_created_at,
        isGenerated: !!user.referral_link
      };
    });

    console.log(`Found ${usersWithLinks.length} users with referral links`);

    return NextResponse.json({
      success: true,
      users: usersWithLinks,
      totalUsers: usersWithLinks.length,
      generatedLinks: usersWithLinks.filter((u: any) => u.isGenerated).length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching user referral links:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user referral links',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== GENERATE ALL REFERRAL LINKS API START ===');
    
    const { generateForAll = false } = await request.json();
    
    // Get database connection
    const db = mysql.createPool({
      host: process.env.MYSQL_HOST || "hopper.proxy.rlwy.net",
      port: Number(process.env.MYSQL_PORT) || 50359,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "QxNkIyShqDFSigZzxHaxiyZmqtzekoXL",
      database: process.env.MYSQL_DATABASE || "railway",
      ssl: {
        rejectUnauthorized: false
      },
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0
    });

    // Create referral_links table if not exists
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

    if (generateForAll) {
      // Generate referral links for all users
      const [allUsers] = await db.execute('SELECT user_id, referral_code FROM users WHERE referral_code IS NOT NULL') as any;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bdspro-fawn.vercel.app';
      
      let generatedCount = 0;
      
      for (const user of allUsers) {
        const referralLink = `${baseUrl}/signup?ref=${user.referral_code}`;
        
        try {
          await db.execute(`
            INSERT INTO referral_links (user_id, referral_code, referral_link) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
            referral_link = VALUES(referral_link),
            updated_at = CURRENT_TIMESTAMP
          `, [user.user_id, user.referral_code, referralLink]);
          
          generatedCount++;
        } catch (error) {
          console.error(`Error generating link for user ${user.user_id}:`, error);
        }
      }
      
      console.log(`Generated ${generatedCount} referral links`);
      
      return NextResponse.json({
        success: true,
        message: `Generated ${generatedCount} referral links for all users`,
        generatedCount,
        totalUsers: allUsers.length
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Referral links table ready'
    });

  } catch (error) {
    console.error('Error generating all referral links:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate referral links',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
