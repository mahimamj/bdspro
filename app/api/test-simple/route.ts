import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE TEST API START ===');
    
    const body = await request.json();
    console.log('Request body received:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Test API is working',
      data: body
    });

  } catch (error) {
    console.error('=== SIMPLE TEST API ERROR ===');
    console.error('Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Test API error',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
