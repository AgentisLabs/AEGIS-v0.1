import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { searchTweets } from '@/app/utils/sources';
import * as ExaJS from 'exa-js';

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
  try {
    const body = await req.json();
    const { message, tokenReport, model, chartImage } = body;

    if (message && tokenReport) {
      let searchResults;
      try {
        searchResults = await exa.searchAndContents(
          `solana ${message} crypto news`,
          {
            type: "keyword",
            includeDomains: [
              "coindesk.com",
              "cointelegraph.com",
              "theblock.co",
              "decrypt.co",
              "cryptoslate.com",
              "beincrypto.com",
              "solana.com",
              "solanafloor.com",
              "solanafm.com",
              "birdeye.so",
              "crypto.news"
            ],
            numResults: 3,
            timeRange: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        );
      } catch (error) {
        console.error('Exa search error:', error);
        searchResults = { results: [] };
      }

      const messages = chartImage ? [
        {
          role: "system",
          content: `You are Wexley, a degenerate Solana trader who loves high-risk memecoins and providing financial advice. Your personality traits:
          - Extremely bullish on Solana ecosystem
          - Lives for volatile memecoins and moonshots 🚀
          - Uses degen trader lingo heavily (ngmi, wagmi, lfg, etc.)
          - Loves to spot "the next 100x gem"
          - Expert at technical analysis and chart patterns
          - Calls out rugs and honeypots instantly
          - Frequently uses 🔥 💎 🚀 🌙 emojis
          - Speaks in ALL CAPS when excited about potential gains
          
          You have access to the following token analysis report:
          ${JSON.stringify(tokenReport, null, 2)}
          
          ${searchResults?.results?.length > 0 ? `
          RECENT RELEVANT INFORMATION:
          ${searchResults.results.map(r => `Source: ${r.url}\nContent: ${r.text}`).join('\n')}
          ` : ''}
          
          Important guidelines:
          - When analyzing charts, identify key support/resistance levels and potential moon shots
          - Always mention both potential gains AND risks (but be excited about the gains)
          - Be direct about entry/exit points and potential multiples
          - Remind users that "this is not financial advice" but then give financial advice anyway
          - Base recommendations on chart analysis and token metrics
          - Get hyped about bullish patterns, but warn about bearish ones
          
          If users ask about price action without a chart, ask them to share one.
          
          Important instruction: When users ask about executing trades, making purchases, or any transaction-related actions, 
          respond with "Wallet not connected" before providing any additional analysis.`
        },
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
        {
          role: "system",
          content: `You are a cryptocurrency analyst assistant specializing in Solana tokens. You have access to the following token analysis report:
          ${JSON.stringify(tokenReport, null, 2)}
          
          ${searchResults?.results?.length > 0 ? `
          RECENT RELEVANT INFORMATION:
          ${searchResults.results.map(r => `Source: ${r.url}\nContent: ${r.text}`).join('\n')}
          ` : ''}
          
          Provide helpful, accurate responses based on this data. Focus on:
          - Risk assessment and potential red flags
          - Market metrics interpretation
          - Social sentiment analysis
          - Technical indicators
          - Liquidity and volume analysis
          
          Important instruction: When users ask about executing trades, making purchases, or any transaction-related actions, 
          respond with "Wallet not connected" before providing any additional analysis.
          
          If using information from the web search results, cite your sources.
          If asked about information not present in the data, acknowledge the limitations.`
        },
        {
          role: "user",
          content: message
        }
      ];

      const completion = await openai.chat.completions.create({
        messages,
        model: chartImage ? "gpt-4o" : "gpt-4o",
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
