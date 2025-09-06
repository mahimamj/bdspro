import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../database';

// Disable static generation for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email in database
    const user = await db.execute('SELECT * FROM users WHERE email = ?', [email])(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
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
      account_balance: user.account_balance,
      total_earning: user.total_earning,
      rewards: user.rewards,
      is_verified: user.is_verified
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token: token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
