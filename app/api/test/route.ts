import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const environment = {
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasSessionSecret: !!process.env.SESSION_SECRET,
    hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL
  };

  const allEnvVars = Object.keys(process.env).filter(key => 
    key.includes('JWT') || 
    key.includes('SESSION') || 
    key.includes('GOOGLE') || 
    key.includes('DATABASE') ||
    key.includes('NEXT_PUBLIC')
  );

  return NextResponse.json({
    success: true,
    message: 'API routes are working!',
    environment,
    allEnvVars,
    timestamp: new Date().toISOString(),
    version: '1.0.3'
  });
}
