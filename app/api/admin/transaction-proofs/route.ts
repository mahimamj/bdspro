import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export const dynamic = 'force-dynamic';

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
        i.hash_password,
        i.full_name,
        i.email,
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
    
    // Debug each transaction
    if (transactions && transactions.length > 0) {
      console.log('\n=== TRANSACTION DETAILS ===');
      transactions.forEach((tx: any, index: number) => {
        console.log(`Transaction ${index + 1}:`);
        console.log(`  ID: ${tx.id}`);
        console.log(`  Hash: ${tx.transaction_hash}`);
        console.log(`  Amount: ${tx.amount}`);
        console.log(`  Referred: ${tx.referred_name} (${tx.referred_email})`);
        console.log(`  Referrer: ${tx.referrer_name || 'N/A'} (${tx.referrer_email || 'N/A'})`);
        console.log(`  Status: ${tx.status}`);
        console.log('---');
      });
    }

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
    console.log('=== TRANSACTION STATUS UPDATE API ===');
    
    // For now, we'll allow access without authentication
    // In production, implement proper admin authentication

    const { transactionId, status } = await request.json();
    console.log('Received data:', { transactionId, status });

    if (!transactionId || !status) {
      console.log('Missing required fields');
      return NextResponse.json({ error: 'Transaction ID and status are required' }, { status: 400 });
    }

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      console.log('Invalid status:', status);
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

    // Get transaction details first
    console.log('Getting transaction details...');
    const [transactionDetails] = await db.execute(
      'SELECT i.*, u.user_id, u.name, u.email FROM images i LEFT JOIN users u ON i.referred_id = u.user_id WHERE i.id = ?',
      [transactionId]
    ) as any;

    if (transactionDetails.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const transaction = transactionDetails[0];
    console.log('Transaction details:', transaction);

    // Update image status
    console.log('Updating transaction status...');
    const [result] = await db.execute(
      'UPDATE images SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, transactionId]
    );
    console.log('Database update result:', result);

    // If status is verified, update user account balance and create transaction record
    if (status === 'verified' && transaction.user_id) {
      console.log('Updating user account balance...');
      
      // Update user's account balance and total earnings
      const [userUpdate] = await db.execute(
        'UPDATE users SET account_balance = account_balance + ?, total_earning = total_earning + ?, updated_at = NOW() WHERE user_id = ?',
        [transaction.amount, transaction.amount, transaction.user_id]
      );
      console.log('User balance update result:', userUpdate);

      // Create transaction record
      const [transactionRecord] = await db.execute(
        'INSERT INTO transactions (user_id, amount, type, description, timestamp, balance) VALUES (?, ?, ?, ?, NOW(), (SELECT account_balance FROM users WHERE user_id = ?))',
        [
          transaction.user_id,
          transaction.amount,
          'deposit',
          `Payment verification - Transaction #${transactionId}`,
          transaction.user_id
        ]
      );
      console.log('Transaction record created:', transactionRecord);

      console.log(`Successfully credited $${transaction.amount} to user ${transaction.name} (${transaction.email})`);
    }

    return NextResponse.json({ 
      success: true, 
      message: status === 'verified' ? 
        `Transaction verified and $${transaction.amount} credited to user account!` : 
        'Transaction status updated successfully!' 
    });

  } catch (error) {
    console.error('Error updating transaction status:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction status' }, 
      { status: 500 }
    );
  }
}
