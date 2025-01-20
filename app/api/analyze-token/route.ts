import { checkUsageLimit } from '@/app/utils/db';
import { searchTokenInfo } from '@/app/utils/sources';
import { postAnalysisToTwitter } from '@/app/utils/twitter';
import { saveAnalysis } from '@/app/utils/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  const allowed = await checkUsageLimit(ip, 'search');
  if (!allowed) {
    return new Response(JSON.stringify({
      error: 'Daily search limit reached. Please try again tomorrow.'
    }), { status: 429 });
  }
  
  try {
    const { address } = await request.json();
    
    if (!address) {
      return NextResponse.json({ error: 'Token address is required' }, { status: 400 });
    }

    console.log('Analyzing token:', address);
    
    // Get token analysis
    const tokenInfo = await searchTokenInfo(address);
    
    if (!tokenInfo) {
      return NextResponse.json({ error: 'Failed to analyze token' }, { status: 500 });
    }

    let tweetId: string | undefined;
    
    // Post to Twitter
    try {
      tweetId = await postAnalysisToTwitter(tokenInfo);
    } catch (twitterError) {
      console.error('Twitter post failed:', twitterError);
    }

    // Save analysis to database
    const analysisId = await saveAnalysis(tokenInfo, tweetId);

    return NextResponse.json({ 
      data: tokenInfo,
      social: {
        tweetId,
        tweetUrl: tweetId ? `https://twitter.com/i/web/status/${tweetId}` : undefined
      },
      shareUrl: `https://agentis.sh/analysis/${analysisId}`
    });

  } catch (error) {
    console.error('Error in analyze-token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 