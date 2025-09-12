import { NextRequest, NextResponse } from 'next/server';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('=== LOGIN START ===');
    
    const body = await request.json();
    console.log('Request body received:', { email: body.email });
    
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Test database connection first
    console.log('Testing database connection...');
    try {
      const [testResult] = await db.execute('SELECT 1 as test');
      console.log('Database connection successful:', testResult);
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      if (dbError instanceof Error) {
        return NextResponse.json(
          { success: false, message: 'Database connection failed', error: dbError.message },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { success: false, message: 'Database connection failed', error: 'Unknown database error' },
          { status: 500 }
        );
      }
    }

    // Find user by email
    console.log('Looking for user with email:', email);
    try {
      const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]) as any;
      console.log('Users found:', users.length);
      
      if (users.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const user = users[0];
      console.log('User found:', { user_id: user.user_id, name: user.name, email: user.email, referral_code: user.referral_code });

      // Check password
      console.log('Checking password...');
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      console.log('Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user.user_id, email: user.email },
        process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development',
        { expiresIn: '24h' }
      );

      const userData = {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        account_balance: user.account_balance || 0.00,
        total_earning: user.total_earning || 0.00,
        rewards: user.rewards || 0.00,
        referral_code: user.referral_code
      };

      console.log('Login successful, returning user data:', userData);

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userData,
          token: token
        }
      });
      
    } catch (dbError) {
      console.error('Error during login:', dbError);
      return NextResponse.json(
        { success: false, message: 'Database error during login', error: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
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
