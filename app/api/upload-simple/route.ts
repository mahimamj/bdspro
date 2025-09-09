import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE UPLOAD API START ===');
    
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const transactionHash = formData.get('transactionHash') as string;
    const amount = formData.get('amount') as string;

    console.log('Form data received:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      transactionHash,
      amount
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

    // Use simple values for now
    const mockUserId = 1;
    const mockReferrerId = null;

    // Insert image record (without file storage for now)
    const imageUrl = `/uploads/mock_${Date.now()}.jpg`;
    console.log('Inserting record with imageUrl:', imageUrl);
    
    try {
      const [insertResult] = await db.execute(
        'INSERT INTO images (referred_id, referrer_id, image_url, transaction_hash, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
        [mockUserId, mockReferrerId, imageUrl, transactionHash || 'test_hash', amount || '50.00', 'pending']
      );
      
      console.log('Database insert result:', insertResult);
      console.log('Database record inserted successfully with ID:', (insertResult as any).insertId);
    } catch (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      message: 'Transaction proof uploaded successfully!' 
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
