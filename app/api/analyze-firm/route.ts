import { NextResponse } from 'next/server';
import { getFirmAnalysis, saveFirmAnalysis, logSearch } from '@/app/utils/db';
import { searchTweets, searchPropFirmInfo, searchTrustpilotReviews, generateFirmScore } from '@/app/utils/sources';

// Add these type definitions at the top of the file
interface TwitterData {
  sentiment: string;
  summary: string;
  common_themes: string[];
  notable_praise: string[];
  notable_complaints: string[];
  engagement_level: string;
}

interface AnalysisInput {
  twitter_sentiment: any[]; // Keep as any[] for now since we're using raw tweet data
  prop_firm_info: any;
  trustpilot_reviews: any[];
}

interface AnalysisData {
  twitter_sentiment: any[];
  prop_firm_info: any;
  trustpilot_reviews: any[];
}

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

    // Add type declarations
    let tweets: any[] = [];
    let propFirmInfo: any = null;
    let trustpilotReviews: any[] = [];
    
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
    } satisfies AnalysisData);

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
