import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: NextRequest) {
  try {
    // For now, we'll allow access without authentication
    // In production, implement proper admin authentication

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

    // Get all image proofs with user details
    console.log('=== FETCHING TRANSACTION PROOFS FROM DATABASE ===');
    const [transactions] = await db.execute(`
      SELECT 
        i.id,
        i.referred_id,
        i.referrer_id,
        i.image_url,
        i.transaction_hash,
        i.amount,
        i.status,
        i.created_at,
        u1.name as referred_name,
        u1.email as referred_email,
        u2.name as referrer_name,
        u2.email as referrer_email
      FROM images i
      LEFT JOIN users u1 ON i.referred_id = u1.user_id
      LEFT JOIN users u2 ON i.referrer_id = u2.user_id
      ORDER BY i.created_at DESC
    `) as any;

    console.log('Database query result:', transactions);
    console.log('Number of transactions found:', transactions?.length || 0);

    return NextResponse.json({ 
      success: true, 
      transactions: transactions || [] 
    });

  } catch (error) {
    console.error('Error fetching transaction proofs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction proofs' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // For now, we'll allow access without authentication
    // In production, implement proper admin authentication

    const { transactionId, status } = await request.json();

    if (!transactionId || !status) {
      return NextResponse.json({ error: 'Transaction ID and status are required' }, { status: 400 });
    }

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
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

    // Update image status
    await db.execute(
      'UPDATE images SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, transactionId]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Transaction status updated successfully!' 
    });

  } catch (error) {
    console.error('Error updating transaction status:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction status' }, 
      { status: 500 }
    );
  }
}
