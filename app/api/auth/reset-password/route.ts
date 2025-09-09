import { NextRequest, NextResponse } from 'next/server';
const bcrypt = require('bcryptjs');
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('=== RESET PASSWORD API START ===');
    
    const { token, newPassword } = await request.json();
    console.log('Reset request received for token:', token ? 'present' : 'missing');
    
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Verify the reset token from the database
    const [resetTokens] = await db.execute(
      'SELECT * FROM password_resets WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    ) as any;

    if (resetTokens.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const resetToken = resetTokens[0];
    console.log('Valid reset token found for user:', resetToken.user_id);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Password hashed successfully');

    // Update the user's password
    await db.execute(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [hashedPassword, resetToken.user_id]
    );

    // Mark the reset token as used
    await db.execute(
      'UPDATE password_resets SET used = TRUE WHERE id = ?',
      [resetToken.id]
    );

    console.log('Password reset completed successfully for user:', resetToken.user_id);

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('=== RESET PASSWORD API ERROR ===');
    console.error('Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while resetting your password. Please try again later.' 
      },
      { status: 500 }
    );
  }
}
