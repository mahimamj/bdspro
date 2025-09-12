import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.MYSQL_HOST || "hopper.proxy.rlwy.net",
  port: Number(process.env.MYSQL_PORT) || 50359,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "QxNkIyShqDFSigZzxHaxiyZmqtzekoXL",
  database: process.env.MYSQL_DATABASE || "railway",
  ssl: {
    rejectUnauthorized: false
  }
});

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== USER DATA API START ===');
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('Token received:', token.substring(0, 20) + '...');

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development') as any;
    const userId = decoded.user_id;
    console.log('Decoded user ID:', userId);

    // Get user data from database
    const [users] = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
    
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];
    console.log('User found:', { user_id: user.user_id, name: user.name, email: user.email });

    // Get user's transactions
    const [transactions] = await db.execute(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    console.log('Transactions found:', transactions.length);

    const userData = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      account_balance: user.account_balance || 0.00,
      total_earning: user.total_earning || 0.00,
      rewards: user.rewards || 0.00,
      referral_code: user.referral_code,
      recent_transactions: transactions
    };

    console.log('User data prepared:', userData);

    return NextResponse.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('=== USER DATA API ERROR ===');
    
    if (error instanceof Error) {
      console.error('Error:', error.message);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to get user data',
          error: error.message
        },
        { status: 500 }
      );
    } else {
      console.error('Unknown error:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to get user data',
          error: 'Unknown error occurred'
        },
        { status: 500 }
      );
    }
  }
}
