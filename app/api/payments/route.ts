import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const network = formData.get('network') as string;
    const walletAddress = formData.get('walletAddress') as string;
    const file = formData.get('image') as File;

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
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `payment_${timestamp}.${fileExtension}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Save to database
    try {
      // First, check if user exists by email
      const [users] = await db.execute('SELECT user_id FROM users WHERE email = ?', [email]) as any;
      let userId = null;
      
      if (users.length > 0) {
        userId = users[0].user_id;
      } else {
        // Create a new user if they don't exist
        const [newUser] = await db.execute(
          'INSERT INTO users (name, email, password_hash, account_balance, total_earning, rewards, referral_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [fullName, email, '', 0, 0, 0, 'BDS_' + Math.random().toString(36).substr(2, 8).toUpperCase()]
        ) as any;
        userId = newUser.insertId;
      }

      // Insert payment record into images table
      const [result] = await db.execute(
        'INSERT INTO images (referred_id, referrer_id, image_url, transaction_hash, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, null, `/uploads/${filename}`, `TXN_${timestamp}`, amount, 'pending']
      ) as any;

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
      return NextResponse.json(
        { success: false, message: 'Failed to save payment to database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Payment submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
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
