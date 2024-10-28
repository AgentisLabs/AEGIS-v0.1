import { NextResponse } from 'next/server';
import { 
  searchTweets, 
  searchPropFirmInfo, 
  searchTrustpilotReviews,
  generateFirmScore
} from '@/app/utils/sources';

export async function POST(req: Request) {
  try {
    const { firmName } = await req.json();
    
    if (!firmName || typeof firmName !== 'string') {
      return NextResponse.json(
        { error: 'Invalid firm name provided' },
        { status: 400 }
      );
    }

    console.log('Starting analysis for:', firmName);

    // Try each API call separately to identify which one fails
    let tweets = [];
    try {
      tweets = await searchTweets(firmName);
      console.log('Twitter search completed:', tweets.length, 'tweets found');
    } catch (error) {
      console.error('Twitter search failed:', error);
    }

    let propFirmInfo = null;
    try {
      propFirmInfo = await searchPropFirmInfo(firmName);
      console.log('PropFirmMatch search completed:', !!propFirmInfo);
    } catch (error) {
      console.error('PropFirmMatch search failed:', error);
    }

    let trustpilotReviews = null;
    try {
      trustpilotReviews = await searchTrustpilotReviews(firmName);
      console.log('Trustpilot search completed:', !!trustpilotReviews);
    } catch (error) {
      console.error('Trustpilot search failed:', error);
    }

    // Generate the analysis
    let analysis = null;
    try {
      analysis = await generateFirmScore({
        twitter_sentiment: tweets,
        prop_firm_info: propFirmInfo,
        trustpilot_reviews: trustpilotReviews
      });
      console.log('Analysis generated:', analysis);
    } catch (error) {
      console.error('Analysis generation failed:', error);
    }

    // Create the report card with the analysis results
    const reportCard = {
      name: firmName,
      overall_score: analysis?.overall_score || 0,
      summary: analysis?.summary || "Analysis completed with available data",
      strengths: analysis?.strengths || [],
      weaknesses: analysis?.weaknesses || [],
      sources: analysis?.sources || [],
      raw_data: {
        tweets,
        propFirmInfo,
        trustpilotReviews
      }
    };

    console.log('Analysis completed successfully');
    return NextResponse.json(reportCard);
    
  } catch (error) {
    console.error('Route handler error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze firm',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
