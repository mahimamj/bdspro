import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection
const getDbConnection = () => {
  return mysql.createPool({
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
};

// GET: Get user by email
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET USER BY EMAIL API START ===');
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email parameter is required' 
        },
        { status: 400 }
      );
    }

    const db = getDbConnection();
    
    // Get user by email
    const [users] = await db.execute(`
      SELECT 
        user_id,
        name,
        email,
        phone,
        account_balance,
        total_earning,
        rewards,
        referral_code,
        referrer_id,
        created_at,
        updated_at
      FROM users 
      WHERE email = ?
    `, [email]) as any;

    if (users.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found' 
        },
        { status: 404 }
      );
    }

    const user = users[0];
    console.log('Found user:', user.email);

    return NextResponse.json({
      success: true,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        account_balance: user.account_balance,
        total_earning: user.total_earning,
        rewards: user.rewards,
        referral_code: user.referral_code,
        referrer_id: user.referrer_id,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
