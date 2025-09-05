import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database';

// Disable static generation for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, confirmPassword } = body;

    // Validate input
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

    // Check if user already exists in database
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
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
    const createResult = await db.createUser({
      name,
      email,
      password_hash: hashedPassword,
      referral_code,
      referrer_id: null
    });

    if (!createResult.success) {
      return NextResponse.json(
        { success: false, message: `Failed to create user: ${createResult.error}` },
        { status: 500 }
      );
    }

    // Get the created user
    const newUser = await db.findUserById(createResult.user_id);

    // Generate JWT token
    const token = jwt.sign(
      { user_id: newUser.user_id, email: email },
      process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development',
      { expiresIn: '24h' }
    );

    const userData = {
      user_id: newUser.user_id,
      name: newUser.name,
      email: newUser.email,
      account_balance: newUser.account_balance,
      total_earning: newUser.total_earning,
      rewards: newUser.rewards,
      is_verified: newUser.is_verified
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
