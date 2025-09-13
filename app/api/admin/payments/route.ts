import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== ADMIN PAYMENTS API START ===');
    
    // Get all payment records from images table
    const [payments] = await db.execute(
      'SELECT id, referred_id, referrer_id, image_url, transaction_hash, amount, status, hash_password, full_name, email, created_at, updated_at FROM images ORDER BY created_at DESC'
    ) as any;

    console.log('Payments found:', payments.length);

    // Transform the data for admin display
    const adminPayments = payments.map((payment: any) => ({
      id: payment.id,
      userId: payment.referred_id,
      referrerId: payment.referrer_id,
      fullName: payment.full_name,
      email: payment.email,
      amount: payment.amount,
      imageUrl: payment.image_url,
      transactionHash: payment.transaction_hash,
      hashPassword: payment.hash_password ? payment.hash_password.substring(0, 20) + '...' : null,
      status: payment.status,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at
    }));

    return NextResponse.json({
      success: true,
      payments: adminPayments,
      total: adminPayments.length
    });

  } catch (error) {
    console.error('=== ADMIN PAYMENTS API ERROR ===');
    console.error('Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch payment records',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('=== ADMIN UPDATE PAYMENT STATUS ===');
    
    const { id, status } = await request.json();
    
    if (!id || !status) {
      return NextResponse.json(
        { success: false, message: 'Payment ID and status are required' },
        { status: 400 }
      );
    }

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status. Must be pending, verified, or rejected' },
        { status: 400 }
      );
    }

    // Update payment status
    const [result] = await db.execute(
      'UPDATE images SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Payment record not found' },
        { status: 404 }
      );
    }

    console.log('Payment status updated successfully:', { id, status });

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
      paymentId: id,
      newStatus: status
    });

  } catch (error) {
    console.error('=== ADMIN UPDATE PAYMENT ERROR ===');
    console.error('Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update payment status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}