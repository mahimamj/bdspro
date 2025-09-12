import { NextRequest, NextResponse } from 'next/server';

// Mock data - replace with actual database queries
const mockPayments = [
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
  },
  {
    id: 'PAY_1234567892',
    fullName: 'Bob Johnson',
    email: 'bob@example.com',
    amount: 75,
    network: 'TRC20',
    screenshot: '/uploads/payment_1234567892.jpg',
    status: 'rejected',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
    adminNotes: 'Insufficient amount - minimum 50 USDT required'
  }
];

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Verify JWT token
    // For now, just check if it exists

    return NextResponse.json({
      success: true,
      payments: mockPayments
    });

  } catch (error) {
    console.error('Fetch admin payments error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
