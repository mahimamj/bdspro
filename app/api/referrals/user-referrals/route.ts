import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's referral code
    const [users] = await db.execute('SELECT referral_code FROM users WHERE user_id = ?', [userId]) as any;
    
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const referralCode = users[0].referral_code;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const referralLink = `${baseUrl}/signup?ref=${referralCode}`;

    // Get level 1 referrals
    const [level1Referrals] = await db.execute(`
      SELECT 
        u.user_id as id,
        u.name,
        u.email,
        u.created_at as joinedDate,
        COALESCE(SUM(i.amount), 0) as totalInvested
      FROM users u
      LEFT JOIN images i ON u.user_id = i.referred_id
      WHERE u.referrer_id = ?
      GROUP BY u.user_id, u.name, u.email, u.created_at
    `, [userId]) as any;

    // Get level 2 referrals
    const [level2Referrals] = await db.execute(`
      SELECT 
        u2.user_id as id,
        u2.name,
        u2.email,
        u2.created_at as joinedDate,
        COALESCE(SUM(i.amount), 0) as totalInvested
      FROM users u1
      JOIN users u2 ON u1.user_id = u2.referrer_id
      LEFT JOIN images i ON u2.user_id = i.referred_id
      WHERE u1.referrer_id = ?
      GROUP BY u2.user_id, u2.name, u2.email, u2.created_at
    `, [userId]) as any;

    return NextResponse.json({
      success: true,
      user: {
        referralCode,
        referralLink
      },
      referrals: {
        level1: level1Referrals,
        level2: level2Referrals
      }
    });

  } catch (error) {
    console.error('Error fetching user referrals:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}