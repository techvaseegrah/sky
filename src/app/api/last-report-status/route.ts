import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ReportLog from '@/models/ReportLog';

export async function GET() {
  try {
    await connectDB();
    // Find the single most recent log entry by sorting by date
    const lastLog = await ReportLog.findOne().sort({ sentAt: -1 });

    if (!lastLog) {
      return NextResponse.json({ message: 'No report has been sent yet.' });
    }

    return NextResponse.json(lastLog);
  } catch (error) {
    console.error('Error fetching last report status:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}