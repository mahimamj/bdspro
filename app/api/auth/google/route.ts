import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  console.log('=== Google OAuth Debug ===');
  console.log('URL:', request.url);
  console.log('Code:', code);
  console.log('Error:', error);
  console.log('GOOGLE_CLIENT_ID:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('GOOGLE_CLIENT_SECRET:', !!process.env.GOOGLE_CLIENT_SECRET);
  console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }

  if (!code) {
    // Redirect to Google OAuth
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID || '');
    googleAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google`);
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
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google`,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response:', tokenData);

    if (!tokenData.access_token) {
      console.error('No access token received:', tokenData);
      return NextResponse.redirect(new URL(`/login?error=no_access_token&details=${encodeURIComponent(JSON.stringify(tokenData))}`, request.url));
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    console.log('Google user data:', userData);

    // For now, just redirect to dashboard with basic info
    const redirectUrl = new URL('/dashboard', request.url);
    redirectUrl.searchParams.set('google_auth', 'success');
    redirectUrl.searchParams.set('name', userData.name);
    redirectUrl.searchParams.set('email', userData.email);

    console.log('Redirecting to dashboard:', redirectUrl.toString());
    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('Google OAuth error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.redirect(new URL(`/login?error=oauth_failed&details=${encodeURIComponent(errorMessage)}`, request.url));
  }
}
