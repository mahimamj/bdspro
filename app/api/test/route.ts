import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'API routes are working!',
    environment: {
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasSessionSecret: !!process.env.SESSION_SECRET,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    },
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('JWT') || key.includes('SESSION') || key.includes('GOOGLE') || key.includes('APP_URL')
    ),
    timestamp: new Date().toISOString(),
    version: '1.0.2' // Force redeploy
  });
}
