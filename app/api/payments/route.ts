import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

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
    const hashPassword = formData.get('hashPassword') as string;
    const network = formData.get('network') as string;
    const walletAddress = formData.get('walletAddress') as string;
    const file = formData.get('image') as File;
    const screenshot = formData.get('screenshot') as File;
    
    // Use the correct file field
    const imageFile = file || screenshot;

    console.log('Payment data received:', {
      fullName,
      email,
      amount,
      network,
      walletAddress,
      fileName: imageFile?.name,
      fileSize: imageFile?.size
    });

    // Validation
    if (!fullName || !email || !amount || !hashPassword || !network || !imageFile || !walletAddress) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (hashPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Hash password must be at least 6 characters' },
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
    if (!allowedTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { success: false, message: 'Only JPG and PNG files are allowed' },
        { status: 400 }
      );
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(hashPassword, saltRounds);
    console.log('Password hashed successfully');

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = imageFile.name.split('.').pop() || 'png';
    const filename = `payment_${timestamp}.${fileExtension}`;
    
    // Upload file to Vercel Blob storage
    let fileUrl: string;
    try {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      console.log('Uploading file to Vercel Blob storage:', {
        filename,
        size: buffer.length,
        type: imageFile.type
      });
      
      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: imageFile.type,
      });
      
      fileUrl = blob.url;
      console.log('File uploaded successfully to:', fileUrl);
    } catch (blobError) {
      console.error('Error uploading to Vercel Blob:', blobError);
      
      // Fallback to base64 storage if Vercel Blob fails
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
      const base64Data = buffer.toString('base64');
      fileUrl = `data:${file.type};base64,${base64Data}`;
      console.log('Using base64 fallback for file storage');
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
        timestamp,
        hashedPassword: hashedPassword.substring(0, 20) + '...' // Log only first 20 chars for security
      });
      
      const [result] = await db.execute(
        'INSERT INTO images (referred_id, referrer_id, image_url, transaction_hash, amount, status, hash_password, full_name, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, null, fileUrl, `TXN_${timestamp}`, amount, 'pending', hashedPassword, fullName, email]
      ) as any;
      console.log('Successfully inserted into images table with ID:', result.insertId);

    const paymentRecord = {
        id: result.insertId,
      fullName,
      email,
      amount,
      hashPassword: hashedPassword.substring(0, 20) + '...', // Only show first 20 chars for security
      network,
      screenshot: fileUrl,
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
