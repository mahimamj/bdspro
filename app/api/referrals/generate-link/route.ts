import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
  try {
    console.log('=== GENERATE REFERRAL LINK API START ===');
    
    const { userId, customCode } = await request.json();
    
    console.log('Generate link request:', { userId, customCode });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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

    // Get user information
    const [userResult] = await db.execute(
      'SELECT user_id, name, email, referral_code FROM users WHERE user_id = ?',
      [userId]
    ) as any;

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult[0];
    let referralCode = user.referral_code;

    // If custom code provided, validate and update
    if (customCode) {
      // Check if custom code is already taken
      const [existingCode] = await db.execute(
        'SELECT user_id FROM users WHERE referral_code = ? AND user_id != ?',
        [customCode, userId]
      ) as any;

      if (existingCode.length > 0) {
        return NextResponse.json(
          { error: 'Referral code already taken' },
          { status: 400 }
        );
      }

      // Update user's referral code
      await db.execute(
        'UPDATE users SET referral_code = ? WHERE user_id = ?',
        [customCode, userId]
      );
      referralCode = customCode;
    }

    // Generate referral link
    const baseUrl = 'https://bdspro-fawn.vercel.app';
    const referralLink = `${baseUrl}/signup?ref=${referralCode}`;

    // Store referral link in database (create referral_links table if not exists)
    try {
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

      // Insert or update referral link
      await db.execute(`
        INSERT INTO referral_links (user_id, referral_code, referral_link) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
        referral_code = VALUES(referral_code),
        referral_link = VALUES(referral_link),
        updated_at = CURRENT_TIMESTAMP
      `, [userId, referralCode, referralLink]);

    } catch (error) {
      console.error('Error managing referral_links table:', error);
    }

    console.log('Referral link generated:', referralLink);

    return NextResponse.json({
      success: true,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email
      },
      referralCode,
      referralLink,
      shortLink: referralLink, // For future QR code generation
      message: 'Referral link generated successfully'
    });

  } catch (error) {
    console.error('Error generating referral link:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate referral link',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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

    // Get user's referral link
    const [linkResult] = await db.execute(`
      SELECT 
        rl.user_id,
        rl.referral_code,
        rl.referral_link,
        rl.clicks,
        rl.signups,
        u.name,
        u.email
      FROM referral_links rl
      LEFT JOIN users u ON rl.user_id = u.user_id
      WHERE rl.user_id = ?
    `, [userId]) as any;

    if (linkResult.length === 0) {
      return NextResponse.json(
        { error: 'Referral link not found' },
        { status: 404 }
      );
    }

    const link = linkResult[0];

    return NextResponse.json({
      success: true,
      user: {
        id: link.user_id,
        name: link.name,
        email: link.email
      },
      referralCode: link.referral_code,
      referralLink: link.referral_link,
      clicks: link.clicks,
      signups: link.signups,
      createdAt: link.created_at
    });

  } catch (error) {
    console.error('Error fetching referral link:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch referral link',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
