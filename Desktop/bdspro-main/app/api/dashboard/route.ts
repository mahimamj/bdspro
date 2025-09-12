import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Disable static generation for this route
export const dynamic = 'force-dynamic';

// Simple in-memory database (replace with real database in production)
let users: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development') as any;
    
    // Find user
    const user = users.find(u => u.user_id === decoded.user_id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Mock dashboard data
    const dashboardData = {
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        account_balance: user.account_balance,
        total_earning: user.total_earning,
        rewards: user.rewards,
        is_verified: user.is_verified
      },
      stats: {
        totalBalance: user.account_balance,
        totalEarnings: user.total_earning,
        totalRewards: user.rewards,
        activeTrades: 0,
        completedTrades: 0
      },
      recentTransactions: [],
      notifications: []
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
