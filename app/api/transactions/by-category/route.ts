import { NextRequest, NextResponse } from 'next/server';
const getDbConnection = require('../db-connection');\nconst db = getDbConnection();

// Disable static generation for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const withdrawal_from = searchParams.get('withdrawal_from');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category parameter is required' },
        { status: 400 }
      );
    }

    // Build the query based on category
    let query = 'SELECT * FROM transactions WHERE type = ?';
    const params: any[] = [category];

    // Add additional filters
    if (withdrawal_from) {
      query += ' AND withdrawal_from = ?';
      params.push(withdrawal_from);
    }

    if (start) {
      query += ' AND DATE(timestamp) >= ?';
      params.push(start);
    }

    if (end) {
      query += ' AND DATE(timestamp) <= ?';
      params.push(end);
    }

    query += ' ORDER BY timestamp DESC LIMIT 100';

    // Execute query
    const [rows] = await db.db.execute(query, params);

    // Format the data for the frontend
    const formattedData = rows.map((row: any) => ({
      date: new Date(row.timestamp).toLocaleDateString(),
      withdrawal_amount: parseFloat(row.amount || 0),
      transaction_id: row.id.toString(),
      withdrawal_from: row.withdrawal_from || 'N/A',
      type: row.type,
      description: row.description,
      status: row.status,
      balance: parseFloat(row.balance || 0)
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      total: formattedData.length
    });

  } catch (error) {
    console.error('Error fetching transactions by category:', error);
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
