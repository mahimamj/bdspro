import { NextRequest, NextResponse } from 'next/server';
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
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DATABASE TEST START ===');
    console.log('Environment variables:');
    console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
    console.log('MYSQL_PORT:', process.env.MYSQL_PORT);
    console.log('MYSQL_USER:', process.env.MYSQL_USER);
    console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? 'SET' : 'NOT SET');
    console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
    
    // Test basic connection
    const [testResult] = await db.execute('SELECT 1 as test');
    console.log('Basic connection successful:', testResult);
    
    // Check users table
    const [users] = await db.execute('SELECT * FROM users LIMIT 5');
    console.log('Users found:', users.length);
    
    // Get user count
    const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
    console.log('Total user count:', userCount[0].count);
    
    return NextResponse.json({
      success: true,
      message: 'Database test successful',
      data: {
        connection: 'success',
        userCount: userCount[0].count,
        sampleUsers: users
      }
    });

  } catch (error) {
    console.error('=== DATABASE TEST ERROR ===');
    if (error instanceof Error) {
      console.error('Error:', error.message);
      console.error('Error code:', (error as any).code);
      console.error('Error errno:', (error as any).errno);
      console.error('Error sqlState:', (error as any).sqlState);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database test failed',
          error: error.message,
          errorCode: (error as any).code,
          errorErrno: (error as any).errno,
          errorSqlState: (error as any).sqlState
        },
        { status: 500 }
      );
    } else {
      console.error('Error:', String(error));
      return NextResponse.json(
        { 
          success: false, 
          message: 'Database test failed',
          error: 'Unknown error occurred'
        },
        { status: 500 }
      );
    }
  }
}
