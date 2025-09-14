import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== TRANSACTIONS API START ===');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('Request URL:', request.url);
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    console.log('User ID from params:', userId);
    
    if (!userId) {
      console.log('No user ID provided');
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching transactions for user ID:', userId);
    
    // Get transactions for the user (remove limit to show all transactions)
    const [transactions] = await db.execute(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC',
      [userId]
    ) as any;

    console.log('Raw transactions from DB:', transactions);
    console.log('Transactions found:', transactions.length);

    // Transform the data for frontend display
    const formattedTransactions = transactions.map((transaction: any) => ({
      id: transaction.id,
      date: transaction.timestamp,
      name: getTransactionName(transaction.type),
      detail: transaction.description,
      credit: transaction.type === 'deposit' ? parseFloat(transaction.amount) : 0,
      debit: transaction.type === 'withdrawal' ? parseFloat(transaction.amount) : 0,
      balance: parseFloat(transaction.balance || 0),
      type: transaction.type,
      status: transaction.status
    }));

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      total: formattedTransactions.length
    });

  } catch (error) {
    console.error('=== TRANSACTIONS API ERROR ===');
    console.error('Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch transactions',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getTransactionName(type: string): string {
  switch (type) {
    case 'deposit':
      return 'Deposit';
    case 'withdrawal':
      return 'Withdrawal';
    case 'cashback':
      return 'Cashback';
    case 'level1_income':
      return 'Level 1 Income';
    case 'level2_income':
      return 'Level 2 Income';
    case 'reward':
      return 'Reward';
    default:
      return 'Transaction';
  }
}
