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

// GET: Fetch all deposits with user info
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET DEPOSITS API START ===');
    
    const db = getDbConnection();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const userId = searchParams.get('userId') || '';
    
    const offset = (page - 1) * limit;
    
    // Build query with filters
    let whereClause = '1=1';
    const queryParams: any[] = [];
    
    if (status) {
      whereClause += ' AND d.status = ?';
      queryParams.push(status);
    }
    
    if (userId) {
      whereClause += ' AND d.user_id = ?';
      queryParams.push(userId);
    }
    
    if (search) {
      whereClause += ' AND (d.transaction_hash LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR d.wallet_address LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Get total count
    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total
      FROM deposits d
      LEFT JOIN users u ON d.user_id = u.user_id
      WHERE ${whereClause}
    `, queryParams) as any;
    
    const total = countResult[0].total;
    
    // Get deposits with pagination
    const [deposits] = await db.execute(`
      SELECT 
        d.id,
        d.user_id,
        d.amount,
        d.payment_method,
        d.wallet_address,
        d.transaction_hash,
        d.status,
        d.payment_proof_url,
        d.admin_notes,
        d.created_at,
        d.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM deposits d
      LEFT JOIN users u ON d.user_id = u.user_id
      WHERE ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]) as any;
    
    console.log(`Found ${deposits.length} deposits (page ${page}/${Math.ceil(total / limit)})`);
    
    return NextResponse.json({
      success: true,
      data: deposits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching deposits:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch deposits',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: Add a new deposit
export async function POST(request: NextRequest) {
  try {
    console.log('=== POST DEPOSITS API START ===');
    
    const body = await request.json();
    const { 
      user_id, 
      amount, 
      payment_method, 
      wallet_address, 
      transaction_hash,
      payment_proof_url 
    } = body;
    
    // Validate required fields
    if (!user_id || !amount || !payment_method || !wallet_address) {
      return NextResponse.json(
        { 
          success: false,
          error: 'user_id, amount, payment_method, and wallet_address are required' 
        },
        { status: 400 }
      );
    }
    
    // Validate amount (minimum 50 USDT)
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount < 50) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Minimum deposit amount is 50 USDT' 
        },
        { status: 400 }
      );
    }
    
    // Validate payment method
    if (!['USDT_TRC20', 'USDT_BEP20'].includes(payment_method)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'payment_method must be either USDT_TRC20 or USDT_BEP20' 
        },
        { status: 400 }
      );
    }
    
    const db = getDbConnection();
    
    // Check if user exists
    const [userCheck] = await db.execute(
      'SELECT user_id FROM users WHERE user_id = ?',
      [user_id]
    ) as any;
    
    if (userCheck.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not found' 
        },
        { status: 404 }
      );
    }
    
    // Insert new deposit
    const [result] = await db.execute(`
      INSERT INTO deposits (user_id, amount, payment_method, wallet_address, transaction_hash, payment_proof_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [user_id, depositAmount, payment_method, wallet_address, transaction_hash || null, payment_proof_url || null]) as any;
    
    const newDepositId = result.insertId;
    
    // Get the created deposit with user info
    const [newDeposit] = await db.execute(`
      SELECT 
        d.id,
        d.user_id,
        d.amount,
        d.payment_method,
        d.wallet_address,
        d.transaction_hash,
        d.status,
        d.payment_proof_url,
        d.admin_notes,
        d.created_at,
        d.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM deposits d
      LEFT JOIN users u ON d.user_id = u.user_id
      WHERE d.id = ?
    `, [newDepositId]) as any;
    
    console.log('Created deposit:', newDeposit[0]);
    
    return NextResponse.json({
      success: true,
      data: newDeposit[0],
      message: 'Deposit created successfully'
    });
    
  } catch (error) {
    console.error('Error creating deposit:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create deposit',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT: Update deposit status (for admin verification)
export async function PUT(request: NextRequest) {
  try {
    console.log('=== PUT DEPOSITS API START ===');
    
    const body = await request.json();
    const { id, status, admin_notes } = body;
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'id is required' 
        },
        { status: 400 }
      );
    }
    
    if (status && !['pending', 'verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'status must be pending, verified, or rejected' 
        },
        { status: 400 }
      );
    }
    
    const db = getDbConnection();
    
    // Check if deposit exists
    const [existingDeposit] = await db.execute(
      'SELECT * FROM deposits WHERE id = ?',
      [id]
    ) as any;
    
    if (existingDeposit.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Deposit not found' 
        },
        { status: 404 }
      );
    }
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    
    if (admin_notes !== undefined) {
      updateFields.push('admin_notes = ?');
      updateValues.push(admin_notes);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No fields to update' 
        },
        { status: 400 }
      );
    }
    
    updateValues.push(id);
    
    // Update deposit
    await db.execute(`
      UPDATE deposits 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, updateValues);
    
    // Get updated deposit with user info
    const [updatedDeposit] = await db.execute(`
      SELECT 
        d.id,
        d.user_id,
        d.amount,
        d.payment_method,
        d.wallet_address,
        d.transaction_hash,
        d.status,
        d.payment_proof_url,
        d.admin_notes,
        d.created_at,
        d.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM deposits d
      LEFT JOIN users u ON d.user_id = u.user_id
      WHERE d.id = ?
    `, [id]) as any;
    
    console.log('Updated deposit:', updatedDeposit[0]);
    
    return NextResponse.json({
      success: true,
      data: updatedDeposit[0],
      message: 'Deposit updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating deposit:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update deposit',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove a deposit
export async function DELETE(request: NextRequest) {
  try {
    console.log('=== DELETE DEPOSITS API START ===');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'id parameter is required' 
        },
        { status: 400 }
      );
    }
    
    const db = getDbConnection();
    
    // Check if deposit exists
    const [existingDeposit] = await db.execute(
      'SELECT * FROM deposits WHERE id = ?',
      [id]
    ) as any;
    
    if (existingDeposit.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Deposit not found' 
        },
        { status: 404 }
      );
    }
    
    // Delete deposit
    await db.execute('DELETE FROM deposits WHERE id = ?', [id]);
    
    console.log(`Deleted deposit with id: ${id}`);
    
    return NextResponse.json({
      success: true,
      message: 'Deposit deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting deposit:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete deposit',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}