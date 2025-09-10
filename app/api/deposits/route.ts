import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEPOSITS API START ===');
    
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

    console.log('Database connection created');

    // Query deposits with user information
    const [deposits] = await db.execute(`
      SELECT 
        d.id as deposit_id,
        d.user_id,
        u.name as user_name,
        u.email as user_email,
        d.amount,
        d.payment_method,
        d.status,
        d.created_at,
        d.updated_at
      FROM deposits d
      LEFT JOIN users u ON d.user_id = u.user_id
      ORDER BY d.created_at DESC
      LIMIT 100
    `) as any;

    console.log(`Found ${deposits.length} deposits`);

    // Format the response
    const formattedDeposits = deposits.map((deposit: any) => ({
      id: deposit.deposit_id,
      userId: deposit.user_id,
      userName: deposit.user_name || 'Unknown User',
      userEmail: deposit.user_email || 'No email',
      amount: parseFloat(deposit.amount).toFixed(2),
      paymentMethod: deposit.payment_method,
      status: deposit.status,
      createdAt: deposit.created_at,
      updatedAt: deposit.updated_at
    }));

    return NextResponse.json({
      success: true,
      deposits: formattedDeposits,
      count: formattedDeposits.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching deposits:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch deposits',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE DEPOSIT API START ===');
    
    const { userId, amount, paymentMethod, status = 'pending' } = await request.json();
    
    console.log('Deposit data received:', {
      userId,
      amount,
      paymentMethod,
      status
    });

    // Validate required fields
    if (!userId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'User ID, amount, and payment method are required' },
        { status: 400 }
      );
    }

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

    // Insert new deposit
    const [insertResult] = await db.execute(
      'INSERT INTO deposits (user_id, amount, payment_method, status) VALUES (?, ?, ?, ?)',
      [userId, amount, paymentMethod, status]
    ) as any;

    const depositId = insertResult.insertId;
    console.log('Deposit created successfully with ID:', depositId);

    return NextResponse.json({
      success: true,
      message: 'Deposit created successfully',
      deposit: {
        id: depositId,
        userId,
        amount,
        paymentMethod,
        status
      }
    });

  } catch (error) {
    console.error('Error creating deposit:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create deposit',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
