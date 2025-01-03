import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { searchTweets } from '@/app/utils/sources';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function searchTokenData(tokenAddress: string) {
  const tweets = await searchTweets(tokenAddress);
  return {
    tweets,
    timestamp: new Date().toISOString()
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tokenAddress, message, tokenReport } = body;

    // If it's a follow-up question about a token
    if (message && tokenReport) {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a cryptocurrency analyst assistant specializing in Solana tokens. You have access to the following token analysis report:
            ${JSON.stringify(tokenReport, null, 2)}
            
            Provide helpful, accurate responses based on this data. Focus on:
            - Risk assessment and potential red flags
            - Market metrics interpretation
            - Social sentiment analysis
            - Technical indicators
            - Liquidity and volume analysis
            
            If asked about information not present in the report, acknowledge the limitations of available data.`
          },
          {
            role: "user",
            content: message
          }
        ],
        model: "gpt-4",
        temperature: 0.7,
      });

      return NextResponse.json({ 
        response: completion.choices[0].message.content 
      });
    }

    // If it's the initial token analysis
    if (!tokenAddress || typeof tokenAddress !== 'string') {
      return NextResponse.json(
        { error: 'Invalid token address provided' },
        { status: 400 }
      );
    }

    let sourceData;
    try {
      sourceData = await searchTokenData(tokenAddress);
    } catch (error) {
      console.error('Error fetching token data:', error);
      sourceData = {
        tweets: [],
        timestamp: new Date().toISOString()
      };
    }

    const analysisPrompt = `
      Analyze this Solana token based on the following data:
      
      Twitter Mentions: ${sourceData.tweets.length ? JSON.stringify(sourceData.tweets) : 'No Twitter data available'}
      
      Create a detailed analysis that includes:
      1. Overall risk score (0-100)
      2. Detailed summary of strengths and weaknesses
      3. Risk assessment and red flags as well as potential upside opportunity
      4. Social sentiment analysis
      
      Format response as JSON with fields:
      {
        "overall_score": number,
        "summary": string,
        "strengths": string[],
        "weaknesses": string[],
        "risk_assessment": {
          "level": string,
          "factors": string[],
          "liquidity_risk": string,
          "volatility_risk": string,
          "manipulation_risk": string
        },
        "market_metrics": {
          "price_trend": string,
          "liquidity_assessment": string,
          "trading_volume": string,
          "sustainability": string
        },
        "social_metrics": {
          "sentiment_score": number,
          "community_trust": number,
          "trending_score": number,
          "summary": string
        }
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a cryptocurrency risk analyst specializing in Solana meme coins. Your analysis should be data-driven, and focused on identifying potential upside opportunity or risks and red flags."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      model: "gpt-4o",
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({
      address: tokenAddress,
      ...result,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error in token analysis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
