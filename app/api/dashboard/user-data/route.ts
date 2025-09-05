import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../database';
import jwt from 'jsonwebtoken';

// Disable static generation for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development');
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.user_id;

    // Get user data from database
    const user = await db.findUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's transaction summary
    const [transactionSummary] = await db.pool.execute(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as total_deposits,
        SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END) as total_withdrawals,
        SUM(CASE WHEN type = 'growth' THEN amount ELSE 0 END) as total_growth,
        SUM(CASE WHEN type LIKE '%income%' THEN amount ELSE 0 END) as total_income
      FROM transactions 
      WHERE user_id = ?
    `, [userId]);

    // Get recent transactions
    const [recentTransactions] = await db.pool.execute(`
      SELECT * FROM transactions 
      WHERE user_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 10
    `, [userId]);

    // Get referral statistics
    const [referralStats] = await db.pool.execute(`
      SELECT 
        COUNT(*) as total_referrals,
        SUM(CASE WHEN level = 1 THEN 1 ELSE 0 END) as level1_referrals,
        SUM(CASE WHEN level = 2 THEN 1 ELSE 0 END) as level2_referrals
      FROM referrals 
      WHERE referrer_id = ?
    `, [userId]);

    const summary = transactionSummary[0] || {};
    const referrals = referralStats[0] || {};

    return NextResponse.json({
      success: true,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        account_balance: parseFloat(user.account_balance || 0),
        total_earning: parseFloat(user.total_earning || 0),
        rewards: parseFloat(user.rewards || 0),
        referral_code: user.referral_code,
        is_verified: user.is_verified,
        created_at: user.created_at
      },
      summary: {
        total_transactions: parseInt(summary.total_transactions || 0),
        total_deposits: parseFloat(summary.total_deposits || 0),
        total_withdrawals: parseFloat(summary.total_withdrawals || 0),
        total_growth: parseFloat(summary.total_growth || 0),
        total_income: parseFloat(summary.total_income || 0)
      },
      referrals: {
        total_referrals: parseInt(referrals.total_referrals || 0),
        level1_referrals: parseInt(referrals.level1_referrals || 0),
        level2_referrals: parseInt(referrals.level2_referrals || 0)
      },
      recent_transactions: recentTransactions.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        amount: parseFloat(tx.amount || 0),
        description: tx.description,
        status: tx.status,
        timestamp: tx.timestamp
      }))
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch user data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
