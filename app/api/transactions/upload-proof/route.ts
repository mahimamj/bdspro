import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
  try {
    // For now, we'll use a mock user ID. In production, implement proper authentication
    const mockUserId = 1; // This should come from your authentication system

    const formData = await request.formData();
    const file = formData.get('image') as File;
    const transactionHash = formData.get('transactionHash') as string;
    const amount = formData.get('amount') as string;
    const referrerId = formData.get('referrerId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `transaction_${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

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

    // Get user's referrer_id from database
    const [userResult] = await db.execute(
      'SELECT referrer_id FROM users WHERE user_id = ?',
      [mockUserId]
    ) as any;

    const userReferrerId = userResult.length > 0 ? userResult[0].referrer_id : null;

    // Insert image record
    const imageUrl = `/uploads/${fileName}`;
    await db.execute(
      'INSERT INTO images (referred_id, referrer_id, image_url, transaction_hash, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
      [mockUserId, userReferrerId, imageUrl, transactionHash, amount || null, 'pending']
    );

    console.log('Transaction proof uploaded successfully:', {
      referredId: mockUserId,
      referrerId: userReferrerId,
      imageUrl,
      transactionHash,
      amount
    });

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      message: 'Transaction proof uploaded successfully!' 
    });

  } catch (error) {
    console.error('Error uploading transaction proof:', error);
    return NextResponse.json(
      { error: 'Failed to upload transaction proof' }, 
      { status: 500 }
    );
  }
}
