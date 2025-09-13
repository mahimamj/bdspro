import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('=== PAYMENT SUBMISSION START ===');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Content-Type:', request.headers.get('content-type'));
    
    let formData;
    try {
      formData = await request.formData();
      console.log('FormData parsed successfully');
    } catch (formDataError) {
      console.error('FormData parsing error:', formDataError);
      return NextResponse.json(
        { success: false, message: 'Failed to parse form data', error: formDataError instanceof Error ? formDataError.message : 'Unknown error' },
        { status: 400 }
      );
    }
    
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const network = formData.get('network') as string;
    const walletAddress = formData.get('walletAddress') as string;
    const file = formData.get('image') as File;

    console.log('Payment data received:', {
      fullName,
      email,
      amount,
      network,
      walletAddress,
      fileName: file?.name,
      fileSize: file?.size
    });

    // Validation
    if (!fullName || !email || !amount || !network || !file || !walletAddress) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (amount < 50) {
      return NextResponse.json(
        { success: false, message: 'Minimum deposit is 50 USDT' },
        { status: 400 }
      );
    }

    if (!['trc20', 'bep20'].includes(network)) {
      return NextResponse.json(
        { success: false, message: 'Invalid network selection' },
        { status: 400 }
      );
    }

    // File validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Only JPG and PNG files are allowed' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    console.log('Uploads directory path:', uploadsDir);
    
    try {
      if (!existsSync(uploadsDir)) {
        console.log('Creating uploads directory...');
        await mkdir(uploadsDir, { recursive: true });
        console.log('Uploads directory created successfully');
      } else {
        console.log('Uploads directory already exists');
      }
    } catch (dirError) {
      console.error('Error creating uploads directory:', dirError);
      return NextResponse.json(
        { success: false, message: 'Failed to create uploads directory', error: dirError instanceof Error ? dirError.message : 'Directory creation error' },
        { status: 500 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'png';
    const filename = `payment_${timestamp}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);
    console.log('File will be saved to:', filepath);

    // Save file
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);
      console.log('File saved successfully');
    } catch (fileError) {
      console.error('Error saving file:', fileError);
      return NextResponse.json(
        { success: false, message: 'Failed to save file', error: fileError instanceof Error ? fileError.message : 'File save error' },
        { status: 500 }
      );
    }

    // Save to database
    try {
      console.log('Starting database operations...');
      
      // Test database connection first
      try {
        const [testResult] = await db.execute('SELECT 1 as test') as any;
        console.log('Database connection test successful:', testResult);
      } catch (dbTestError) {
        console.error('Database connection test failed:', dbTestError);
        return NextResponse.json(
          { success: false, message: 'Database connection failed', error: dbTestError instanceof Error ? dbTestError.message : 'Database error' },
          { status: 500 }
        );
      }
      
      // First, check if user exists by email
      const [users] = await db.execute('SELECT user_id FROM users WHERE email = ?', [email]) as any;
      let userId = null;
      
      if (users.length > 0) {
        userId = users[0].user_id;
        console.log('User found with ID:', userId);
      } else {
        // Create a new user if they don't exist
        console.log('Creating new user...');
        const [newUser] = await db.execute(
          'INSERT INTO users (name, email, password_hash, account_balance, total_earning, rewards, referral_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [fullName, email, '', 0, 0, 0, 'BDS_' + Math.random().toString(36).substr(2, 8).toUpperCase()]
        ) as any;
        userId = newUser.insertId;
        console.log('New user created with ID:', userId);
      }

      // Insert into images table with correct column structure
      console.log('Inserting into images table...');
      console.log('Insert data:', {
        userId,
        filename,
        amount,
        timestamp
      });
      
      const [result] = await db.execute(
        'INSERT INTO images (referred_id, referrer_id, image_url, transaction_hash, amount, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [userId, null, `/uploads/${filename}`, `TXN_${timestamp}`, amount, 'pending']
      ) as any;
      console.log('Successfully inserted into images table with ID:', result.insertId);

      const paymentRecord = {
        id: result.insertId,
        fullName,
        email,
        amount,
        network,
        screenshot: `/uploads/${filename}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Payment record saved to database:', paymentRecord);

      return NextResponse.json({
        success: true,
        message: 'Payment submitted successfully',
        paymentId: result.insertId,
        data: paymentRecord
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      console.error('Database error details:', {
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        stack: dbError instanceof Error ? dbError.stack : undefined,
        code: (dbError as any)?.code,
        errno: (dbError as any)?.errno,
        sqlState: (dbError as any)?.sqlState
      });
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to save payment to database',
          error: dbError instanceof Error ? dbError.message : 'Database error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('=== PAYMENT SUBMISSION ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // TODO: Fetch payments from database
    // For now, return mock data
    const mockPayments = [
      {
        id: 'PAY_1234567890',
        fullName: 'John Doe',
        email: 'john@example.com',
        amount: 100,
        network: 'TRC20',
        screenshot: '/uploads/payment_1234567890.jpg',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ];

    const payments = email 
      ? mockPayments.filter(p => p.email === email)
      : mockPayments;

    return NextResponse.json({
      success: true,
      payments
    });

  } catch (error) {
    console.error('Fetch payments error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
