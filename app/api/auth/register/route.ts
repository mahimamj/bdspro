import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../database';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate referral code
    const referral_code = 'BDS_' + Math.random().toString(36).substr(2, 8).toUpperCase();
    
    // Create user in database
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password_hash, referral_code, referrer_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, referral_code, null]
    );

    const userId = result.insertId;

    // Generate JWT token
    const token = jwt.sign(
      { user_id: userId, email: email },
      process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development',
      { expiresIn: '24h' }
    );

    const userData = {
      user_id: userId,
      name: name,
      email: email,
      account_balance: 0.00,
      total_earning: 0.00,
      rewards: 0.00
    };

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userData,
        token: token
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
