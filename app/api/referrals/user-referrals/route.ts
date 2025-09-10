import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: NextRequest) {
  try {
    console.log('=== USER REFERRALS API START ===');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '7'; // Default to user 7 for testing

    console.log('Requested userId:', userId);

    // Get database connection
    console.log('Connecting to database...');
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

    // Test database connection
    try {
      await db.execute('SELECT 1 as test');
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError.message);
      throw new Error(`Database connection failed: ${dbError.message}`);
    }

    // Get user's referral information
    console.log('Fetching user information...');
    const [userResult] = await db.execute(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.referral_code,
        u.referrer_id,
        r.name as referrer_name
      FROM users u
      LEFT JOIN users r ON u.referrer_id = r.user_id
      WHERE u.user_id = ?
    `, [userId]) as any;

    console.log('User query result:', userResult);

    if (userResult.length === 0) {
      console.log('User not found, creating default user data...');
      // Create a default response if user not found
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bdspro-fawn.vercel.app';
      const defaultReferralCode = `BDS${userId.padStart(7, '0')}`;
      
      return NextResponse.json({
        success: true,
        user: {
          id: parseInt(userId),
          name: 'Demo User',
          email: 'demo@example.com',
          referralCode: defaultReferralCode,
          referralLink: `${baseUrl}/signup?ref=${defaultReferralCode}`,
          referrerName: null
        },
        referrals: {
          level1: [],
          level2: []
        },
        statistics: {
          level1Count: 0,
          level2Count: 0,
          level1Total: '0.00',
          level2Total: '0.00',
          level1Commission: '0.00',
          level2Commission: '0.00',
          totalCommission: '0.00'
        }
      });
    }

    const user = userResult[0];
    console.log('Found user:', user);

    // Get user's referrals (Level 1 - direct referrals)
    console.log('Fetching Level 1 referrals...');
    let level1Referrals = [];
    try {
      const [level1Result] = await db.execute(`
        SELECT 
          u.user_id,
          u.name,
          u.email,
          u.created_at,
          COALESCE(SUM(COALESCE(d.amount, 0)), 0) as total_invested,
          COUNT(d.id) as deposit_count
        FROM users u
        LEFT JOIN deposits d ON u.user_id = d.user_id
        WHERE u.referrer_id = ?
        GROUP BY u.user_id, u.name, u.email, u.created_at
        ORDER BY u.created_at DESC
      `, [userId]) as any;
      level1Referrals = level1Result;
      console.log('Level 1 referrals found:', level1Referrals.length);
    } catch (error) {
      console.error('Error fetching Level 1 referrals:', error.message);
      level1Referrals = [];
    }

    // Get Level 2 referrals (referrals of referrals)
    console.log('Fetching Level 2 referrals...');
    let level2Referrals = [];
    try {
      const [level2Result] = await db.execute(`
        SELECT 
          u2.user_id,
          u2.name,
          u2.email,
          u2.created_at,
          COALESCE(SUM(COALESCE(d.amount, 0)), 0) as total_invested,
          COUNT(d.id) as deposit_count,
          u1.name as level1_referral_name
        FROM users u1
        JOIN users u2 ON u2.referrer_id = u1.user_id
        LEFT JOIN deposits d ON u2.user_id = d.user_id
        WHERE u1.referrer_id = ?
        GROUP BY u2.user_id, u2.name, u2.email, u2.created_at, u1.name
        ORDER BY u2.created_at DESC
      `, [userId]) as any;
      level2Referrals = level2Result;
      console.log('Level 2 referrals found:', level2Referrals.length);
    } catch (error) {
      console.error('Error fetching Level 2 referrals:', error.message);
      level2Referrals = [];
    }

    // Calculate total earnings
    const level1Total = level1Referrals.reduce((sum: number, ref: any) => sum + parseFloat(ref.total_invested), 0);
    const level2Total = level2Referrals.reduce((sum: number, ref: any) => sum + parseFloat(ref.total_invested), 0);
    
    // Calculate commission (example: 5% for Level 1, 2% for Level 2)
    const level1Commission = level1Total * 0.05;
    const level2Commission = level2Total * 0.02;
    const totalCommission = level1Commission + level2Commission;

    // Generate referral link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bdspro-fawn.vercel.app';
    const referralLink = `${baseUrl}/signup?ref=${user.referral_code}`;

    // Format referrals for frontend
    const formatReferrals = (referrals: any[], level: number) => {
      return referrals.map((ref: any) => ({
        id: ref.user_id,
        name: ref.name,
        email: ref.email,
        joinedDate: new Date(ref.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        }),
        totalInvested: parseFloat(ref.total_invested).toFixed(2),
        depositCount: ref.deposit_count,
        level: level,
        level1ReferralName: ref.level1_referral_name || null
      }));
    };

    const response = {
      success: true,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        referralCode: user.referral_code,
        referralLink,
        referrerName: user.referrer_name
      },
      referrals: {
        level1: formatReferrals(level1Referrals, 1),
        level2: formatReferrals(level2Referrals, 2)
      },
      statistics: {
        level1Count: level1Referrals.length,
        level2Count: level2Referrals.length,
        level1Total: level1Total.toFixed(2),
        level2Total: level2Total.toFixed(2),
        level1Commission: level1Commission.toFixed(2),
        level2Commission: level2Commission.toFixed(2),
        totalCommission: totalCommission.toFixed(2)
      }
    };

    console.log(`Found ${level1Referrals.length} Level 1 referrals and ${level2Referrals.length} Level 2 referrals for user ${userId}`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching user referrals:', error);
    
    // Return a fallback response instead of 500 error
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bdspro-fawn.vercel.app';
    const fallbackUserId = '7';
    const fallbackReferralCode = `BDS${fallbackUserId.padStart(7, '0')}`;
    
    return NextResponse.json({
      success: true,
      user: {
        id: parseInt(fallbackUserId),
        name: 'Demo User',
        email: 'demo@example.com',
        referralCode: fallbackReferralCode,
        referralLink: `${baseUrl}/signup?ref=${fallbackReferralCode}`,
        referrerName: null
      },
      referrals: {
        level1: [],
        level2: []
      },
      statistics: {
        level1Count: 0,
        level2Count: 0,
        level1Total: '0.00',
        level2Total: '0.00',
        level1Commission: '0.00',
        level2Commission: '0.00',
        totalCommission: '0.00'
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true
    });
  }
}
