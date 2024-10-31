import { NextResponse } from 'next/server';
import { getFirmAnalysis, saveFirmAnalysis, logSearch, updateLeaderboard } from '@/app/utils/db';
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

    // Get IP address from request headers
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(/, /)[0] : null;
    
    // Log the search and get total count
    const searchCount = await logSearch(firmName, ip);

    // Check cache first
    let cachedAnalysis = null;
    try {
      cachedAnalysis = await getFirmAnalysis(firmName);
      console.log('Cache check result:', cachedAnalysis ? 'Found in cache' : 'Not in cache');
    } catch (e) {
      console.error('Error checking cache:', e);
    }

    if (cachedAnalysis) {
      console.log('Returning cached analysis for:', firmName);
      return NextResponse.json(cachedAnalysis);
    }

    console.log('Performing new analysis for:', firmName);

    let tweets: any[] = [];
    let propFirmInfo: any = null;
    let trustpilotReviews: any[] = [];
    
    // Perform searches sequentially instead of in parallel for better error tracking
    try {
      console.log('Starting Twitter search...');
      tweets = await searchTweets(firmName);
      console.log('Twitter search complete, tweets found:', tweets.length);
    } catch (e) {
      console.error('Twitter search error:', e);
    }

    try {
      console.log('Starting PropFirm search...');
      propFirmInfo = await searchPropFirmInfo(firmName);
      console.log('PropFirm search complete');
    } catch (e) {
      console.error('PropFirm search error:', e);
    }

    try {
      console.log('Starting Trustpilot search...');
      trustpilotReviews = await searchTrustpilotReviews(firmName);
      console.log('Trustpilot search complete');
    } catch (e) {
      console.error('Trustpilot search error:', e);
    }

    console.log('All searches complete, generating score...');
    
    const analysis = await generateFirmScore({
      twitter_sentiment: tweets,
      prop_firm_info: propFirmInfo,
      trustpilot_reviews: trustpilotReviews
    });

    console.log('Analysis generated:', analysis);

    // Save to firm_analyses
    await saveFirmAnalysis(firmName, {
      ...analysis,
      twitter_data: tweets,
      propfirm_data: propFirmInfo,
      trustpilot_data: trustpilotReviews
    });

    // Also save to leaderboard
    if (analysis && typeof analysis.overall_score === 'number') {
      try {
        await updateLeaderboard(firmName, analysis.overall_score);
        console.log('Leaderboard updated successfully');
      } catch (e) {
        console.error('Error updating leaderboard:', e);
      }
    }

    // Include search count in response
    return NextResponse.json({
      ...analysis,
      times_searched: searchCount
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze firm' },
      { status: 500 }
    );
  }
}
