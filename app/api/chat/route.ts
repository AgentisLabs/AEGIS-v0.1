import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { searchTweets } from '@/app/utils/sources';
import * as ExaJS from 'exa-js';
import { checkUsageLimit } from '@/app/utils/db';
import { WEXLEY_PERSONALITY } from '@/app/lib/constants';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const exa = new ExaJS.default(process.env.EXA_API_KEY!);

async function searchTokenData(tokenAddress: string) {
  const tweets = await searchTweets(tokenAddress);
  return {
    tweets,
    timestamp: new Date().toISOString()
  };
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  const allowed = await checkUsageLimit(ip, 'message');
  if (!allowed) {
    return new Response(JSON.stringify({
      error: 'Daily message limit reached. Please try again tomorrow.'
    }), { status: 429 });
  }
  
  try {
    const body = await req.json();
    const { message, tokenReport, chartImage } = body;

    if (message && tokenReport) {
      const systemMessage = {
        role: "system",
        content: `${WEXLEY_PERSONALITY}

        You have access to the following data:

        TOKEN ANALYSIS REPORT:
        ${JSON.stringify({
          ...tokenReport,
          market_metrics: tokenReport.market_metrics || {},
          social_metrics: tokenReport.social_metrics || {},
        }, null, 2)}
        
        MARKET DATA (from DexScreener):
        Price USD: ${tokenReport.market_data?.price_usd || 'Unknown'}
        Symbol: ${tokenReport.market_data?.symbol || 'Unknown'}
        Liquidity USD: ${tokenReport.market_data?.market_metrics?.liquidity_usd || 'Unknown'}
        Volume 24h: ${tokenReport.market_data?.market_metrics?.volume_24h || 'Unknown'}
        Market Cap: ${tokenReport.market_data?.market_metrics?.marketCap || 'Unknown'}
        FDV: ${tokenReport.market_data?.market_metrics?.fdv || 'Unknown'}
        Price Trend: ${tokenReport.market_data?.market_metrics?.price_trend?.price_trend || 'Unknown'}
        Price Change 24h: ${tokenReport.market_data?.market_metrics?.price_trend?.price_change_24h || 'Unknown'}
        
        SOCIAL METRICS:
        Sentiment Score: ${tokenReport.social_metrics?.sentiment_score || 'Unknown'}
        Community Trust: ${tokenReport.social_metrics?.community_trust || 'Unknown'}
        Trending Score: ${tokenReport.social_metrics?.trending_score || 'Unknown'}
        
        TWITTER DATA:
        ${JSON.stringify(tokenReport.twitter_sentiment || [], null, 2)}
        
        RISK ASSESSMENT:
        Level: ${tokenReport.risk_assessment?.level || 'Unknown'}
        Liquidity Risk: ${tokenReport.risk_assessment?.liquidity_risk || 'Unknown'}
        Volatility Risk: ${tokenReport.risk_assessment?.volatility_risk || 'Unknown'}
        Manipulation Risk: ${tokenReport.risk_assessment?.manipulation_risk || 'Unknown'}`
      };

      const messages = chartImage ? [
        systemMessage,
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: chartImage,
                detail: "high"
              }
            },
            {
              type: "text",
              text: message
            }
          ]
        }
      ] : [
        systemMessage,
        {
          role: "user",
          content: message
        }
      ];

      const completion = await openai.chat.completions.create({
        messages,
        model: "gpt-4o",
        max_tokens: 500,
        temperature: 0.7,
      });

      return NextResponse.json({ 
        response: completion.choices[0].message.content 
      });
    }

    // If it's the initial token analysis
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid token address provided' },
        { status: 400 }
      );
    }

    let sourceData;
    try {
      sourceData = await searchTokenData(message);
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
          content: "You are a cryptocurrency risk and reward analyst specializing in Solana meme coins. Your analysis should be data-drive and focused on identifying potential upside opportunity as well as any risks and red flags."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({
      address: message,
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
