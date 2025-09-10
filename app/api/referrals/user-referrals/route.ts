import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: NextRequest) {
  try {
    console.log('=== USER REFERRALS API START ===');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '7'; // Default to user 7 for testing

    console.log('Requested userId:', userId);

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
    const [level1Referrals] = await db.execute(`
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.created_at,
        COALESCE(SUM(d.amount), 0) as total_invested,
        COUNT(d.id) as deposit_count
      FROM users u
      LEFT JOIN deposits d ON u.user_id = d.user_id AND d.status = 'approved'
      WHERE u.referrer_id = ?
      GROUP BY u.user_id, u.name, u.email, u.created_at
      ORDER BY u.created_at DESC
    `, [userId]) as any;

    // Get Level 2 referrals (referrals of referrals)
    const [level2Referrals] = await db.execute(`
      SELECT 
        u2.user_id,
        u2.name,
        u2.email,
        u2.created_at,
        COALESCE(SUM(d.amount), 0) as total_invested,
        COUNT(d.id) as deposit_count,
        u1.name as level1_referral_name
      FROM users u1
      JOIN users u2 ON u2.referrer_id = u1.user_id
      LEFT JOIN deposits d ON u2.user_id = d.user_id AND d.status = 'approved'
      WHERE u1.referrer_id = ?
      GROUP BY u2.user_id, u2.name, u2.email, u2.created_at, u1.name
      ORDER BY u2.created_at DESC
    `, [userId]) as any;

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
    return NextResponse.json(
      { 
        error: 'Failed to fetch user referrals',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
