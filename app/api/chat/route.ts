import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { getTwitterSentiment, getPropFirmMatchInfo, getTrustpilotInfo } from '@/app/utils/sources';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function searchCompany(firmName: string) {
  const [tweets, propFirmInfo, trustpilotInfo] = await Promise.all([
    getTwitterSentiment(firmName),
    getPropFirmMatchInfo(firmName),
    getTrustpilotInfo(firmName)
  ]);

  return {
    tweets,
    propFirmInfo,
    trustpilotInfo
  };
}

export async function POST(req: Request) {
  try {
    const { firmName } = await req.json();
    
    if (!firmName || typeof firmName !== 'string') {
      return NextResponse.json(
        { error: 'Invalid firm name provided' },
        { status: 400 }
      );
    }

    let sourceData;
    try {
      sourceData = await searchCompany(firmName);
    } catch (error) {
      console.error('Error fetching source data:', error);
      sourceData = {
        tweets: [],
        propFirmInfo: null,
        trustpilotInfo: null
      };
    }

    const analysisPrompt = `
      Analyze this prop trading firm based on the following real data sources:
      
      Twitter Mentions: ${sourceData.tweets.length ? JSON.stringify(sourceData.tweets) : 'No Twitter data available'}
      PropFirmMatch Info: ${sourceData.propFirmInfo ? JSON.stringify(sourceData.propFirmInfo) : 'No PropFirmMatch data available'}
      Trustpilot Reviews: ${sourceData.trustpilotInfo ? JSON.stringify(sourceData.trustpilotInfo) : 'No Trustpilot data available'}
      
      Create a detailed report card that includes:
      1. Overall score (0-10)
      2. Detailed summary of strengths and weaknesses
      3. List of sources used
      
      If limited data is available, note this in the summary and be more conservative with the scoring.
      
      Format response as JSON with fields:
      {
        "score": number,
        "summary": string,
        "sources": string[],
        "details": {
          "strengths": string[],
          "weaknesses": string[],
          "twitterSentiment": string,
          "trustpilotRating": string
        }
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: analysisPrompt }],
      model: "gpt-4",
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({
      name: firmName,
      ...result,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error analyzing firm:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze firm',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
