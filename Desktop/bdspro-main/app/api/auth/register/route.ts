import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('=== REGISTRATION START ===');
    console.log('Environment variables check:');
    console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
    console.log('MYSQL_PORT:', process.env.MYSQL_PORT);
    console.log('MYSQL_USER:', process.env.MYSQL_USER);
    console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? 'SET' : 'NOT SET');
    console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
    
    const body = await request.json();
    console.log('Request body received:', { name: body.name, email: body.email });
    
    const { name, email, password, confirmPassword } = body;

    if (!name || !email || !password || !confirmPassword) {
      console.log('Validation failed: Missing required fields');
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      console.log('Validation failed: Passwords do not match');
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log('Validation failed: Password too short');
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
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
        console.error('Database error details:', {
          message: dbError.message,
          code: (dbError as any).code,
          errno: (dbError as any).errno,
          sqlState: (dbError as any).sqlState
        });
        return NextResponse.json(
          { success: false, message: 'Database connection failed', error: dbError.message },
          { status: 500 }
        );
      } else {
        console.error('Unknown database error:', dbError);
        return NextResponse.json(
          { success: false, message: 'Database connection failed', error: 'Unknown database error' },
          { status: 500 }
        );
      }
    }

    // Check if user already exists
    console.log('Checking if user already exists for email:', email);
    try {
      const [existingUsers] = await db.execute<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
      console.log('Existing users found:', existingUsers.length);
      
      if (existingUsers.length > 0) {
        console.log('User already exists');
        return NextResponse.json(
          { success: false, message: 'User with this email already exists' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('Error checking existing users:', dbError);
      return NextResponse.json(
        { success: false, message: 'Database error checking existing users', error: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Hash password
    console.log('Hashing password...');
    try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log('Password hashed successfully');
      
      // Generate referral code
      const referral_code = 'BDS_' + Math.random().toString(36).substr(2, 8).toUpperCase();
      console.log('Generated referral code:', referral_code);
      
      // Check table structure first
      console.log('Checking users table structure...');
      const [columns] = await db.execute('DESCRIBE users');
      console.log('Users table columns:', columns);
      
      // Create user in database with all required fields
      console.log('Inserting user into database...');
      console.log('Insert data:', {
        name: name,
        email: email,
        password_hash: hashedPassword.substring(0, 20) + '...',
        referral_code: referral_code,
        referrer_id: null
      });
      
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password_hash, referral_code, referrer_id, account_balance, total_earning, rewards, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [name, email, hashedPassword, referral_code, null, 0.00, 0.00, 0.00, '']
      );

      const userId = (result as any).insertId;
      console.log('User created successfully with ID:', userId);

      // Generate JWT token
      console.log('Generating JWT token...');
      const token = jwt.sign(
        { user_id: userId, email: email },
        process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development',
        { expiresIn: '24h' }
      );
      console.log('JWT token generated successfully');

      const userData = {
        user_id: userId,
        name: name,
        email: email,
        account_balance: 0.00,
        total_earning: 0.00,
        rewards: 0.00
      };

      console.log('Registration successful, returning user data:', userData);

      return NextResponse.json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userData,
          token: token
        }
      }, { status: 201 });
      
    } catch (dbError) {
      console.error('Error during user creation:', dbError);
      console.error('Error details:', {
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        code: (dbError as any)?.code,
        errno: (dbError as any)?.errno,
        sqlState: (dbError as any)?.sqlState
      });
      return NextResponse.json(
        { success: false, message: 'Database error during user creation', error: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
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
