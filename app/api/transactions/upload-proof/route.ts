import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD PROOF API START ===');
    
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large:', file.size);
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log('Uploads directory ready');
    } catch (error) {
      console.log('Uploads directory already exists');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `transaction_${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    console.log('Saving file to:', filePath);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    console.log('File saved successfully');

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

    // Insert image record
    const imageUrl = `/uploads/${fileName}`;
    console.log('Inserting record with imageUrl:', imageUrl);
    
    await db.execute(
      'INSERT INTO images (referred_id, referrer_id, image_url, transaction_hash, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
      [mockUserId, mockReferrerId, imageUrl, transactionHash || 'test_hash', amount || '50.00', 'pending']
    );

    console.log('Database record inserted successfully');

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
