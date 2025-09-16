// src/app/api/cron/daily-report/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Verify this is called by a cron service (Vercel, GitHub Actions, etc.)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log('❌ Unauthorized cron request from:', request.headers.get('user-agent'));
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('⏰ Cron job triggered at:', new Date().toISOString());
    
    // Get the base URL for the API call
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host');
    const baseUrl = process.env.NEXTJS_URL || `${protocol}://${host}`;
    
    // Call our daily report API
    const response = await fetch(`${baseUrl}/api/whatsapp/daily-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cronSecret && { 'Authorization': `Bearer ${cronSecret}` })
      },
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Daily report cron job completed successfully');
      return NextResponse.json({ 
        success: true, 
        message: 'Daily report cron job executed successfully',
        timestamp: new Date().toISOString(),
        data: result.data
      });
    } else {
      throw new Error(`Failed to send daily report: ${JSON.stringify(result)}`);
    }
    
  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json({ 
      error: 'Cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// For manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}