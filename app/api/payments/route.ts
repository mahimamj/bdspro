import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const network = formData.get('network') as string;
    const file = formData.get('transactionScreenshot') as File;

    // Validation
    if (!fullName || !email || !amount || !network || !file) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (amount < 50) {
      return NextResponse.json(
        { message: 'Minimum deposit is 50 USDT' },
        { status: 400 }
      );
    }

    if (!['TRC20', 'BEP20'].includes(network)) {
      return NextResponse.json(
        { message: 'Invalid network selection' },
        { status: 400 }
      );
    }

    // File validation
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Only JPG and PNG files are allowed' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File size must be less than 5MB' },
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

    // Create payment record (you can integrate with your database here)
    const paymentRecord = {
      id: `PAY_${timestamp}`,
      fullName,
      email,
      amount,
      network,
      screenshot: `/uploads/${filename}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // TODO: Save to database
    console.log('Payment record created:', paymentRecord);

    return NextResponse.json({
      success: true,
      message: 'Payment submitted successfully',
      paymentId: paymentRecord.id,
      data: paymentRecord
    });

  } catch (error) {
    console.error('Payment submission error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
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
