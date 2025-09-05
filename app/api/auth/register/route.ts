import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Simple in-memory database (replace with real database in production)
let users: any[] = [];

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

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate unique user ID
    const userId = uuidv4();
    
    // Create user
    const newUser = {
      user_id: userId,
      name,
      email,
      password_hash: hashedPassword,
      account_balance: 0,
      total_earning: 0,
      rewards: 0,
      is_verified: false,
      created_at: new Date().toISOString()
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { user_id: userId, email: email },
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
