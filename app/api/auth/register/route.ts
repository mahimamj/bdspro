import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
  try {
    console.log('=== UNIVERSAL REGISTRATION API START ===');
    
    const { name, email, phone, password, referralCode } = await request.json();
    
    console.log('Registration data received for user:', {
      name,
      email,
      phone: phone || 'Not provided',
      hasPassword: !!password,
      referralCode: referralCode || 'Not provided'
    });

    // Validate required fields
    if (!name || !email || !password) {
      console.log('❌ Missing required fields:', { name: !!name, email: !!email, password: !!password });
      return NextResponse.json(
        { 
          success: false,
          error: 'Name, email, and password are required',
          message: 'Please fill in all required fields'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email format',
          message: 'Please enter a valid email address'
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      console.log('❌ Password too short:', password.length);
      return NextResponse.json(
        { 
          success: false,
          error: 'Password too short',
          message: 'Password must be at least 6 characters long'
        },
        { status: 400 }
      );
    }

    // Set default phone if not provided
    const userPhone = phone || '0000000000';

    // Get database connection
    const db = mysql.createPool({
      host: process.env.MYSQL_HOST || "hopper.proxy.rlwy.net",
      port: Number(process.env.MYSQL_PORT) || 50359,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "QxNkIyShqDFSigZzxHaxiyZmqtzekoXL",
      database: process.env.MYSQL_DATABASE || "railway",
      ssl: {
        rejectUnauthorized: false
      },
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0
    });

    console.log('Database connection created');

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    ) as any;
      
      if (existingUsers.length > 0) {
      console.log('User already exists with email:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
      console.log('Password hashed successfully');
      
    // Generate unique referral code
    const generateReferralCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'BDS';
      for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const newReferralCode = generateReferralCode();
    console.log('Generated referral code:', newReferralCode);

    // Handle referral code if provided (universal for any user)
    let referrerId = null;
    let referrerName = null;

    if (referralCode && referralCode.trim() !== '') {
      console.log('Processing referral code for user:', referralCode);
      
      // Find the referrer by their referral code
      const [referrerResult] = await db.execute(
        'SELECT user_id, name FROM users WHERE referral_code = ?',
        [referralCode.trim()]
      ) as any;

      if (referrerResult.length > 0) {
        referrerId = referrerResult[0].user_id;
        referrerName = referrerResult[0].name;
        console.log('✅ Referrer found for user:', { referrerId, referrerName, referralCode });
      } else {
        console.log('❌ Invalid referral code for user:', referralCode);
        return NextResponse.json(
          { 
            error: 'Invalid referral code',
            message: `The referral code "${referralCode}" does not exist. Please check and try again.`
          },
          { status: 400 }
        );
      }
    } else {
      console.log('No referral code provided for user - proceeding without referrer');
    }

    // Insert new user
    const [insertResult] = await db.execute(
      'INSERT INTO users (name, email, phone, password_hash, account_balance, total_earning, rewards, referral_code, referrer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, userPhone, passwordHash, 0, 0, 0, newReferralCode, referrerId]
    ) as any;

    const newUserId = insertResult.insertId;
    console.log('User created successfully with ID:', newUserId);

    // If there's a referrer, create referral record
    if (referrerId) {
      try {
        await db.execute(
          'INSERT INTO referrals (referrer_id, referred_id) VALUES (?, ?)',
          [referrerId, newUserId]
        );
        console.log('Referral record created:', { referrerId, referredId: newUserId });
      } catch (referralError) {
        console.error('Error creating referral record:', referralError);
        // Don't fail the registration if referral record creation fails
      }
    }

    // Verify the user was created correctly
    const [verifyUser] = await db.execute(
      'SELECT user_id, name, email, referral_code, referrer_id FROM users WHERE user_id = ?',
      [newUserId]
    ) as any;

    console.log('User verification:', verifyUser[0]);

      return NextResponse.json({
        success: true,
        message: `User ${name} registered successfully!`,
        data: {
          user: {
            id: newUserId,
            name,
            email,
            referralCode: newReferralCode,
            referrerId,
            referrerName: referrerName || 'No referrer'
          },
          referralInfo: referrerId ? {
            referrerId,
            referrerName,
            referralCode
          } : null
        }
      });

  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error during registration:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    // Return more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = {
      error: 'Registration failed',
      message: errorMessage,
      timestamp: new Date().toISOString()
    };
    
    console.error('Returning error response:', errorDetails);
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
}