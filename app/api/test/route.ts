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
    key.includes('MYSQL') ||
    key.includes('NEXT_PUBLIC')
  );

  return NextResponse.json({
    success: true,
    message: 'API routes are working!',
    environment,
    allEnvVars,
    timestamp: new Date().toISOString(),
    version: '1.0.6',
    debug: {
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      mysqlHost: process.env.MYSQL_HOST ? 'SET' : 'NOT SET'
    }
  });
}
