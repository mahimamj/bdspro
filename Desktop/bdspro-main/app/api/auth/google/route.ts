import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    console.log('=== Google OAuth Debug ===');
    console.log('URL:', request.url);
    console.log('Code:', code);
    console.log('Error:', error);

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(new URL('/login?error=' + error, request.url));
    }

    if (!code) {
      // Check if Google OAuth is configured
      if (!process.env.GOOGLE_CLIENT_ID) {
        console.error('GOOGLE_CLIENT_ID is missing');
        return NextResponse.redirect(new URL('/login?error=google_oauth_not_configured', request.url));
      }

      if (!process.env.GOOGLE_CLIENT_SECRET) {
        console.error('GOOGLE_CLIENT_SECRET is missing');
        return NextResponse.redirect(new URL('/login?error=google_oauth_secret_missing', request.url));
      }

      // Redirect to Google OAuth
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID || '');
      googleAuthUrl.searchParams.set('redirect_uri', (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + '/api/auth/google');
      googleAuthUrl.searchParams.set('response_type', 'code');
      googleAuthUrl.searchParams.set('scope', 'openid email profile');
      googleAuthUrl.searchParams.set('access_type', 'offline');

      console.log('Redirecting to Google OAuth:', googleAuthUrl.toString());
      return NextResponse.redirect(googleAuthUrl.toString());
    }

    try {
      console.log('Exchanging code for token...');
      
      // Exchange code for token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          code,
          grant_type: 'authorization_code',
          redirect_uri: (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000') + '/api/auth/google',
        }),
      });

      const tokenData = await tokenResponse.json();
      console.log('Token response:', tokenData);

      if (!tokenData.access_token) {
        console.error('No access token received:', tokenData);
        return NextResponse.redirect(new URL('/login?error=no_access_token', request.url));
      }

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: 'Bearer ' + tokenData.access_token,
        },
      });

      const userData = await userResponse.json();
      console.log('Google user data:', userData);

      // Check if user exists in database
      console.log('Checking if Google user exists in database for email:', userData.email);
      try {
        const [users] = await db.execute<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [userData.email]);
        const user = (users as RowDataPacket[])[0];
        console.log('Users found:', users.length);
        
        if (!user) {
          // Create new Google OAuth user in database
          console.log('Creating new Google OAuth user in database...');
          const referral_code = 'BDS_' + Math.random().toString(36).substr(2, 8).toUpperCase();
          console.log('Generated referral code for Google user:', referral_code);
          
          const [result] = await db.execute(
            'INSERT INTO users (name, email, password_hash, referral_code, referrer_id) VALUES (?, ?, ?, ?, ?)',
            [userData.name, userData.email, '', referral_code, null]
          );
          
          const userId = (result as any).insertId;
          console.log('Google user created successfully with ID:', userId);
          
          const newUser = {
            user_id: userId,
            name: userData.name,
            email: userData.email,
            account_balance: 0.00,
            total_earning: 0.00,
            rewards: 0.00
          };
          console.log('Google user data:', newUser);
          
          // Create a JWT token for the user
          const jwt = require('jsonwebtoken');
          const token = jwt.sign(
            { 
              user_id: newUser.user_id, 
              email: newUser.email,
              name: newUser.name,
              provider: 'google'
            },
            process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development',
            { expiresIn: '24h' }
          );

          console.log('JWT token created successfully for user:', newUser.user_id);

          // Redirect to dashboard with token in URL (will be stored in localStorage)
          const redirectUrl = new URL('/dashboard', request.url);
          redirectUrl.searchParams.set('google_auth', 'success');
          redirectUrl.searchParams.set('token', token);
          redirectUrl.searchParams.set('name', userData.name);
          redirectUrl.searchParams.set('email', userData.email);

          console.log('Redirecting to dashboard:', redirectUrl.toString());
          return NextResponse.redirect(redirectUrl.toString());
        } else {
          console.log('Google user found in database:', user);
          
          // Create a JWT token for the existing user
          const jwt = require('jsonwebtoken');
          const token = jwt.sign(
            { 
              user_id: user.user_id, 
              email: user.email,
              name: user.name,
              provider: 'google'
            },
            process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development',
            { expiresIn: '24h' }
          );

          console.log('JWT token created successfully for user:', user.user_id);

          // Redirect to dashboard with token in URL (will be stored in localStorage)
          const redirectUrl = new URL('/dashboard', request.url);
          redirectUrl.searchParams.set('google_auth', 'success');
          redirectUrl.searchParams.set('token', token);
          redirectUrl.searchParams.set('name', userData.name);
          redirectUrl.searchParams.set('email', userData.email);

          console.log('Redirecting to dashboard:', redirectUrl.toString());
          return NextResponse.redirect(redirectUrl.toString());
        }
        
      } catch (dbError) {
        console.error('Database error during Google OAuth:', dbError);
        return NextResponse.redirect(new URL('/login?error=database_error', request.url));
      }

    } catch (error) {
      console.error('Google OAuth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
    }

  } catch (error) {
    console.error('=== GOOGLE OAUTH ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }
}
