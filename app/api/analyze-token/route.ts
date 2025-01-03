import { NextResponse } from 'next/server';
import { searchTweets, searchTokenMarketData, searchTokenInfo, analyzeTweetSentiment, generateTokenScore } from '@/app/utils/sources';
import { getTokenAnalysis, saveTokenAnalysis } from '@/app/utils/db';

export async function POST(request: Request) {
  try {
    const { address } = await request.json();

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Valid token address is required' },
        { status: 400 }
      );
    }

    // Check cache first
    try {
      const cached = await getTokenAnalysis(address);
      if (cached) {
        console.log('Found cached analysis for:', address);
        return NextResponse.json({ data: cached });
      }
    } catch (dbError) {
      console.warn('Cache check failed:', dbError);
      // Continue with analysis even if cache check fails
    }

    console.log('Gathering fresh data for:', address);

    // Gather data in parallel
    const [tweets, marketData, tokenInfo] = await Promise.all([
      searchTweets(address),
      searchTokenMarketData(address),
      searchTokenInfo(address)
    ]);

    // Analyze sentiment if we have tweets
    const tweetSentiment = tweets.length > 0 ? 
      await analyzeTweetSentiment(tweets, address) : 
      null;

    // Generate final score
    const analysis = await generateTokenScore({
      twitter_sentiment: tweetSentiment,
      market_data: marketData,
      token_info: tokenInfo
    });

    // Prepare analysis data
    const analysisData = {
      address: address,
      name: analysis.name || 'Unknown Token',
      symbol: analysis.symbol || 'UNKNOWN',
      overall_score: analysis.overall_score || 0,
      summary: analysis.summary || '',
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      sources: analysis.sources || [],
      market_data: marketData,
      market_metrics: analysis.market_metrics || {},
      risk_assessment: analysis.risk_assessment || {},
      social_metrics: analysis.social_metrics || {},
      times_searched: 1
    };

    // Save to database
    try {
      const saved = await saveTokenAnalysis(address, analysisData);
      return NextResponse.json({ data: saved || analysisData });
    } catch (saveError) {
      console.warn('Failed to save analysis:', saveError);
      // Return the analysis even if saving fails
      return NextResponse.json({ data: analysisData });
    }

  } catch (error) {
    console.error('Error in analyze-token:', error);
    return NextResponse.json(
      { error: 'Failed to analyze token', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 