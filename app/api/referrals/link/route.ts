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
  },
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== REFERRAL LINK API START ===');
    
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

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development') as any;
    const userId = decoded.user_id;
    console.log('Decoded user ID:', userId);

    // Get user's referral code
    const [users] = await db.execute(
      'SELECT referral_code FROM users WHERE user_id = ?',
      [userId]
    ) as any;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const referralCode = users[0].referral_code;
    const baseUrl = 'https://bdspro-fawn.vercel.app';
    const referralLink = `${baseUrl}/signup?ref=${referralCode}`;

    console.log('Referral data prepared:', { referral_code: referralCode, referral_link: referralLink });

    return NextResponse.json({
      success: true,
      data: {
        referral_code: referralCode,
        referral_link: referralLink
      }
    });

  } catch (error) {
    console.error('=== REFERRAL LINK API ERROR ===');
    
    if (error instanceof Error) {
      console.error('Error:', error.message);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to get referral link',
          error: error.message
        },
        { status: 500 }
      );
    } else {
      console.error('Unknown error:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to get referral link',
          error: 'Unknown error occurred'
        },
        { status: 500 }
      );
    }
  }
}
