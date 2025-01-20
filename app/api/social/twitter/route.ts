import { NextRequest, NextResponse } from 'next/server';
import { generateReportImage } from '@/app/utils/report-image';
import { postTokenReport } from '@/app/utils/twitter';
import { TokenAnalysis } from '@/app/types';

export async function POST(request: NextRequest) {
  try {
    const analysis: TokenAnalysis = await request.json();

    // Generate the report image
    const imageBuffer = await generateReportImage(analysis);

    // Post to Twitter
    const tweet = await postTokenReport(analysis, imageBuffer);

    return NextResponse.json({ success: true, tweetId: tweet.data.id });
  } catch (error) {
    console.error('Error in Twitter post endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to post report to Twitter' },
      { status: 500 }
    );
  }
} 