import { NextResponse } from 'next/server';
import { getFirmAnalysis, saveFirmAnalysis, logSearch } from '@/app/utils/db';
import { searchTweets, searchPropFirmInfo, searchTrustpilotReviews, generateFirmScore } from '@/app/utils/sources';

export async function POST(req: Request) {
  try {
    const { firmName } = await req.json();
    console.log('Starting analysis for:', firmName);

    if (!firmName) {
      return NextResponse.json(
        { error: 'Firm name is required' },
        { status: 400 }
      );
    }

    // Get IP for analytics
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    await logSearch(firmName, ip);
    
    // Check cache first
    const cachedAnalysis = await getFirmAnalysis(firmName);
    if (cachedAnalysis) {
      console.log('Returning cached analysis for:', firmName);
      return NextResponse.json(cachedAnalysis);
    }

    console.log('Performing new analysis for:', firmName);

    // Perform all searches with error handling
    let tweets = [], propFirmInfo = null, trustpilotReviews = [];
    
    try {
      tweets = await searchTweets(firmName);
    } catch (e) {
      console.error('Twitter search error:', e);
    }

    try {
      propFirmInfo = await searchPropFirmInfo(firmName);
    } catch (e) {
      console.error('PropFirm search error:', e);
    }

    try {
      trustpilotReviews = await searchTrustpilotReviews(firmName);
    } catch (e) {
      console.error('Trustpilot search error:', e);
    }

    const analysis = await generateFirmScore({
      twitter_sentiment: tweets,
      prop_firm_info: propFirmInfo,
      trustpilot_reviews: trustpilotReviews
    });

    // Save to database
    const savedAnalysis = await saveFirmAnalysis(firmName, {
      ...analysis,
      twitter_data: tweets,
      propfirm_data: propFirmInfo,
      trustpilot_data: trustpilotReviews
    });

    return NextResponse.json(savedAnalysis);

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze firm' },
      { status: 500 }
    );
  }
}
