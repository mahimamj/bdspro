import { NextRequest, NextResponse } from 'next/server';

// Mock data - replace with actual database operations
let mockPayments = [
  {
    id: 'PAY_1234567890',
    fullName: 'John Doe',
    email: 'john@example.com',
    amount: 100,
    network: 'TRC20',
    screenshot: '/uploads/payment_1234567890.jpg',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    adminNotes: ''
  },
  {
    id: 'PAY_1234567891',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    amount: 250,
    network: 'BEP20',
    screenshot: '/uploads/payment_1234567891.jpg',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    adminNotes: 'Payment verified successfully'
  }
];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    const { status, adminNotes } = await request.json();

    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status. Must be approved or rejected' },
        { status: 400 }
      );
    }

    // Find and update payment
    const paymentIndex = mockPayments.findIndex(p => p.id === paymentId);
    if (paymentIndex === -1) {
      return NextResponse.json(
        { message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment
    mockPayments[paymentIndex] = {
      ...mockPayments[paymentIndex],
      status,
      adminNotes: adminNotes || mockPayments[paymentIndex].adminNotes,
      updatedAt: new Date().toISOString()
    };

    // TODO: Send email notification to user
    // TODO: Update user's account balance if approved

    return NextResponse.json({
      success: true,
      message: `Payment ${status} successfully`,
      payment: mockPayments[paymentIndex]
    });

  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
