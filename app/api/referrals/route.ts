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

// GET: Fetch all referral codes with user info
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET REFERRALS API START ===');
    
    const db = getDbConnection();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    
    const offset = (page - 1) * limit;
    
    // Build query with filters
    let whereClause = '1=1';
    const queryParams: any[] = [];
    
    if (status) {
      whereClause += ' AND r.status = ?';
      queryParams.push(status);
    }
    
    if (search) {
      whereClause += ' AND (r.referral_code LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Get total count
    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total
      FROM referrals r
      LEFT JOIN users u ON r.user_id = u.user_id
      WHERE ${whereClause}
    `, queryParams) as any;
    
    const total = countResult[0].total;
    
    // Get referrals with pagination
    const [referrals] = await db.execute(`
      SELECT 
        r.id,
        r.user_id,
        r.referral_code,
        r.status,
        r.created_at,
        r.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM referrals r
      LEFT JOIN users u ON r.user_id = u.user_id
      WHERE ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]) as any;
    
    console.log(`Found ${referrals.length} referrals (page ${page}/${Math.ceil(total / limit)})`);
    
    return NextResponse.json({
      success: true,
      data: referrals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch referrals',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: Add a new referral code
export async function POST(request: NextRequest) {
  try {
    console.log('=== POST REFERRALS API START ===');
    
    const body = await request.json();
    const { user_id, referral_code, status = 'active' } = body;
    
    // Validate required fields
    if (!user_id || !referral_code) {
      return NextResponse.json(
        { 
          success: false,
          error: 'user_id and referral_code are required' 
        },
        { status: 400 }
      );
    }
    
    // Validate status
    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'status must be either active or inactive' 
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
    
    // Check if referral code already exists
    const [codeCheck] = await db.execute(
      'SELECT id FROM referrals WHERE referral_code = ?',
      [referral_code]
    ) as any;
    
    if (codeCheck.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Referral code already exists' 
        },
        { status: 409 }
      );
    }
    
    // Insert new referral code
    const [result] = await db.execute(`
      INSERT INTO referrals (user_id, referral_code, status)
      VALUES (?, ?, ?)
    `, [user_id, referral_code, status]) as any;
    
    const newReferralId = result.insertId;
    
    // Get the created referral with user info
    const [newReferral] = await db.execute(`
      SELECT 
        r.id,
        r.user_id,
        r.referral_code,
        r.status,
        r.created_at,
        r.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM referrals r
      LEFT JOIN users u ON r.user_id = u.user_id
      WHERE r.id = ?
    `, [newReferralId]) as any;
    
    console.log('Created referral:', newReferral[0]);
    
    return NextResponse.json({
      success: true,
      data: newReferral[0],
      message: 'Referral code created successfully'
    });
    
  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create referral code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT: Update an existing referral code
export async function PUT(request: NextRequest) {
  try {
    console.log('=== PUT REFERRALS API START ===');
    
    const body = await request.json();
    const { id, user_id, referral_code, status } = body;
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'id is required' 
        },
        { status: 400 }
      );
    }
    
    const db = getDbConnection();
    
    // Check if referral exists
    const [existingReferral] = await db.execute(
      'SELECT * FROM referrals WHERE id = ?',
      [id]
    ) as any;
    
    if (existingReferral.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Referral not found' 
        },
        { status: 404 }
      );
    }
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    
    if (user_id !== undefined) {
      updateFields.push('user_id = ?');
      updateValues.push(user_id);
    }
    
    if (referral_code !== undefined) {
      // Check if new referral code already exists (excluding current record)
      const [codeCheck] = await db.execute(
        'SELECT id FROM referrals WHERE referral_code = ? AND id != ?',
        [referral_code, id]
      ) as any;
      
      if (codeCheck.length > 0) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Referral code already exists' 
          },
          { status: 409 }
        );
      }
      
      updateFields.push('referral_code = ?');
      updateValues.push(referral_code);
    }
    
    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'status must be either active or inactive' 
          },
          { status: 400 }
        );
      }
      updateFields.push('status = ?');
      updateValues.push(status);
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
    
    // Update referral
    await db.execute(`
      UPDATE referrals 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, updateValues);
    
    // Get updated referral with user info
    const [updatedReferral] = await db.execute(`
      SELECT 
        r.id,
        r.user_id,
        r.referral_code,
        r.status,
        r.created_at,
        r.updated_at,
        u.name as user_name,
        u.email as user_email
      FROM referrals r
      LEFT JOIN users u ON r.user_id = u.user_id
      WHERE r.id = ?
    `, [id]) as any;
    
    console.log('Updated referral:', updatedReferral[0]);
    
    return NextResponse.json({
      success: true,
      data: updatedReferral[0],
      message: 'Referral code updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating referral:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update referral code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove a referral code
export async function DELETE(request: NextRequest) {
  try {
    console.log('=== DELETE REFERRALS API START ===');
    
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
    
    // Check if referral exists
    const [existingReferral] = await db.execute(
      'SELECT * FROM referrals WHERE id = ?',
      [id]
    ) as any;
    
    if (existingReferral.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Referral not found' 
        },
        { status: 404 }
      );
    }
    
    // Delete referral
    await db.execute('DELETE FROM referrals WHERE id = ?', [id]);
    
    console.log(`Deleted referral with id: ${id}`);
    
    return NextResponse.json({
      success: true,
      message: 'Referral code deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting referral:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete referral code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
