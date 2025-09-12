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
    console.log('=== TRANSACTIONS BY CATEGORY API START ===');
    
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

    // Get transactions by category
    const [transactions] = await db.execute(
      'SELECT category, COUNT(*) as count, SUM(amount) as total FROM transactions WHERE user_id = ? GROUP BY category',
      [userId]
    );

    console.log('Transactions by category found:', transactions.length);

    return NextResponse.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('=== TRANSACTIONS BY CATEGORY API ERROR ===');
    
    if (error instanceof Error) {
      console.error('Error:', error.message);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to get transactions by category',
          error: error.message
        },
        { status: 500 }
      );
    } else {
      console.error('Unknown error:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to get transactions by category',
          error: 'Unknown error occurred'
        },
        { status: 500 }
      );
    }
  }
}
