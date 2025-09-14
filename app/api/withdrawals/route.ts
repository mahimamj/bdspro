import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('=== WITHDRAWAL REQUEST API ===');
    
    const { userId, email, network, transactionHash, transactionUid, amount } = await request.json();
    
    console.log('Withdrawal request data:', { userId, email, network, transactionHash, transactionUid, amount });
    
    if (!userId || !email || !network || !transactionHash || !transactionUid || !amount) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (amount < 10) {
      return NextResponse.json(
        { success: false, message: 'Minimum withdrawal amount is 10 USDT' },
        { status: 400 }
      );
    }

    // Check if user has sufficient balance
    const [userRows] = await db.execute(
      'SELECT account_balance FROM users WHERE user_id = ?',
      [userId]
    ) as any;

    if (userRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const currentBalance = userRows[0].account_balance;
    if (currentBalance < amount) {
      return NextResponse.json(
        { success: false, message: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const [result] = await db.execute(
      'INSERT INTO withdrawals (user_id, email, network, transaction_hash, transaction_uid, amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [userId, email, network, transactionHash, transactionUid, amount, 'pending']
    ) as any;

    console.log('Withdrawal request created with ID:', result.insertId);

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawalId: result.insertId
    });

  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create withdrawal request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== FETCHING WITHDRAWALS ===');
    
    // First check if withdrawals table exists
    try {
      await db.execute('SELECT 1 FROM withdrawals LIMIT 1');
    } catch (tableError) {
      console.log('Withdrawals table does not exist, creating it...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS withdrawals (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          email VARCHAR(255) NOT NULL,
          network VARCHAR(100) NOT NULL,
          transaction_hash VARCHAR(255),
          transaction_uid VARCHAR(255),
          amount DECIMAL(10,2) NOT NULL,
          status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    
    let query = `
      SELECT w.*, u.name, u.email as user_email, u.password as hashed_password, u.user_id as uid
      FROM withdrawals w 
      LEFT JOIN users u ON w.user_id = u.user_id 
      ORDER BY w.created_at DESC
    `;
    
    let params: any[] = [];
    
    if (status !== 'all') {
      query = `
        SELECT w.*, u.name, u.email as user_email, u.password as hashed_password, u.user_id as uid
        FROM withdrawals w 
        LEFT JOIN users u ON w.user_id = u.user_id 
        WHERE w.status = ?
        ORDER BY w.created_at DESC
      `;
      params = [status];
    }
    
    const [withdrawals] = await db.execute(query, params) as any;
    
    console.log('Withdrawals found:', withdrawals?.length || 0);
    console.log('Withdrawals data:', JSON.stringify(withdrawals, null, 2));
    
    return NextResponse.json({
      success: true,
      withdrawals: Array.isArray(withdrawals) ? withdrawals : []
    });

  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch withdrawals',
        error: error instanceof Error ? error.message : 'Unknown error',
        withdrawals: []
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('=== UPDATE WITHDRAWAL STATUS ===');
    
    const { withdrawalId, status } = await request.json();
    
    if (!withdrawalId || !status) {
      return NextResponse.json(
        { success: false, message: 'Withdrawal ID and status are required' },
        { status: 400 }
      );
    }

    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get withdrawal details
    const [withdrawalRows] = await db.execute(
      'SELECT * FROM withdrawals WHERE id = ?',
      [withdrawalId]
    ) as any;

    if (withdrawalRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    const withdrawal = withdrawalRows[0];

    // Update withdrawal status
    await db.execute(
      'UPDATE withdrawals SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, withdrawalId]
    );

    // If approved, deduct from user balance and create transaction record
    if (status === 'approved') {
      await db.execute(
        'UPDATE users SET account_balance = account_balance - ? WHERE user_id = ?',
        [withdrawal.amount, withdrawal.user_id]
      );

      await db.execute(
        'INSERT INTO transactions (user_id, amount, type, description, timestamp, balance) VALUES (?, ?, ?, ?, NOW(), (SELECT account_balance FROM users WHERE user_id = ?))',
        [
          withdrawal.user_id,
          withdrawal.amount,
          'withdrawal',
          `Withdrawal approved - ${withdrawal.network} - UID: ${withdrawal.transaction_uid || withdrawal.transaction_hash}`,
          withdrawal.user_id
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: `Withdrawal ${status} successfully`
    });

  } catch (error) {
    console.error('Error updating withdrawal status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update withdrawal status' },
      { status: 500 }
    );
  }
}
