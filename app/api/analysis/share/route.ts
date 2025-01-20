import { NextRequest, NextResponse } from 'next/server';
import { postAnalysisToTwitter } from '@/app/utils/twitter';
import { TokenAnalysis } from '@/app/types';

export async function POST(request: NextRequest) {
  try {
    const analysis: TokenAnalysis = await request.json();

    // Post to Twitter
    const tweetId = await postAnalysisToTwitter(analysis);

    return NextResponse.json({
      success: true,
      tweetId,
      tweetUrl: `https://twitter.com/i/web/status/${tweetId}`,
    });
  } catch (error) {
    console.error('Error sharing analysis:', error);
    return NextResponse.json(
      { error: 'Failed to share analysis' },
      { status: 500 }
    );
  }
} 