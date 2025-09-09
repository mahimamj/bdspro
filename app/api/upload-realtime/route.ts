import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
  try {
    console.log('=== REAL-TIME UPLOAD API START ===');
    
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const transactionHash = formData.get('transactionHash') as string;
    const amount = formData.get('amount') as string;
    const userEmail = formData.get('userEmail') as string;

    console.log('Form data received:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      transactionHash,
      amount,
      userEmail
    });

    if (!file) {
      console.log('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
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

    console.log('Database connection created');

    // Get user data from database
    let userId = null;
    let referrerId = null;
    let userName = '';
    let referrerName = '';

    if (userEmail) {
      // Find user by email with referrer info
      const [userResult] = await db.execute(`
        SELECT 
          u.user_id, 
          u.referrer_id, 
          u.name,
          r.name as referrer_name
        FROM users u
        LEFT JOIN users r ON u.referrer_id = r.user_id
        WHERE u.email = ?
      `, [userEmail]) as any;

      if (userResult.length > 0) {
        userId = userResult[0].user_id;
        referrerId = userResult[0].referrer_id;
        userName = userResult[0].name;
        referrerName = userResult[0].referrer_name || 'No referrer';
        console.log('Found user:', { 
          userId, 
          referrerId, 
          userName, 
          referrerName, 
          email: userEmail 
        });
      } else {
        console.log('User not found for email:', userEmail);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    } else {
      // Fallback: use the first available user
      const [users] = await db.execute(`
        SELECT 
          u.user_id, 
          u.referrer_id, 
          u.name,
          r.name as referrer_name
        FROM users u
        LEFT JOIN users r ON u.referrer_id = r.user_id
        ORDER BY u.user_id LIMIT 1
      `) as any;
      
      if (users.length > 0) {
        userId = users[0].user_id;
        referrerId = users[0].referrer_id;
        userName = users[0].name;
        referrerName = users[0].referrer_name || 'No referrer';
        console.log('Using fallback user:', { userId, referrerId, userName, referrerName });
      } else {
        return NextResponse.json({ error: 'No users found in database' }, { status: 404 });
      }
    }

    // Generate unique image URL with timestamp
    const timestamp = Date.now();
    const imageUrl = `/uploads/${userName.replace(/\s+/g, '_')}_${timestamp}_${file.name}`;
    
    console.log('Inserting record with real-time data:', {
      userId,
      referrerId,
      imageUrl,
      transactionHash,
      amount,
      userName,
      referrerName
    });
    
    try {
      const [insertResult] = await db.execute(
        'INSERT INTO images (referred_id, referrer_id, image_url, transaction_hash, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, referrerId, imageUrl, transactionHash || `tx_${timestamp}`, amount || '50.00', 'pending']
      ) as any;
      
      console.log('Database insert result:', insertResult);
      console.log('Database record inserted successfully with ID:', (insertResult as any).insertId);
      
      // Verify the insert by counting records
      const [count] = await db.execute('SELECT COUNT(*) as count FROM images') as any;
      console.log('Total images in database after insert:', count[0].count);
      
    } catch (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      userId,
      referrerId,
      userName,
      referrerName,
      message: `Transaction proof uploaded successfully for ${userName}!` 
    });

  } catch (error) {
    console.error('Error uploading transaction proof:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload transaction proof',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
