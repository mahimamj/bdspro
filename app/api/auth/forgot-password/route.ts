import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, generatePasswordResetEmail } from '@/lib/emailService';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('=== FORGOT PASSWORD API START ===');
    
    const { email } = await request.json();
    console.log('Email received:', email);
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const [users] = await db.execute(
      'SELECT user_id, name, email FROM users WHERE email = ?',
      [email]
    ) as any;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No account found with this email address' },
        { status: 404 }
      );
    }

    const user = users[0];
    console.log('User found:', { user_id: user.user_id, name: user.name, email: user.email });

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    // Store reset token in database
    await db.execute(
      'INSERT INTO password_resets (user_id, email, token, expires_at) VALUES (?, ?, ?, ?)',
      [user.user_id, email, resetToken, expiresAt]
    );
    
    console.log('Reset token stored in database:', resetToken);

    // Generate reset link
    const baseUrl = 'https://bdspro-fawn.vercel.app';
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    
    console.log('Reset link generated:', resetLink);

    // Generate and send email
    const emailOptions = generatePasswordResetEmail(user.name, resetLink);
    emailOptions.to = email;
    
    const emailSent = await sendEmail(emailOptions);
    
    if (!emailSent) {
      console.error('Failed to send email');
      return NextResponse.json(
        { success: false, message: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

    console.log('Password reset email sent successfully to:', email);

    return NextResponse.json({
      success: true,
      message: 'Password reset instructions have been sent to your email address. Please check your inbox and follow the instructions to reset your password.'
    });

  } catch (error) {
    console.error('=== FORGOT PASSWORD API ERROR ===');
    console.error('Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while processing your request. Please try again later.' 
      },
      { status: 500 }
    );
  }
}
