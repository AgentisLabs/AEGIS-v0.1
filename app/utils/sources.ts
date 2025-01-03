import * as ExaJS from 'exa-js';
import OpenAI from 'openai';
import { SearchResult } from '../types';
import { getTokenPrice, analyzeLiquidity } from './jupiter';
import { getSolscanTokenInfo, getTopHolders } from './solscan';

const exa = new ExaJS.default(process.env.EXA_API_KEY!);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

function calculatePriceTrend(priceHistory: any) {
  if (!priceHistory?.last_buy?.price || !priceHistory?.last_sell?.price) {
    return {
      price_change_24h: 0,
      price_trend: 'neutral'
    };
  }

  const avgCurrentPrice = (priceHistory.last_buy.price + priceHistory.last_sell.price) / 2;
  const priceChange = ((avgCurrentPrice - priceHistory.last_sell.price) / priceHistory.last_sell.price) * 100;

  return {
    price_change_24h: priceChange,
    price_trend: priceChange > 0 ? 'up' : priceChange < 0 ? 'down' : 'neutral'
  };
}

export async function searchTweets(query: string, maxResults = 100) {
  try {
    console.log('Searching Twitter for token:', query);
    const results = await exa.searchAndContents(
      query,
      {
        type: "keyword",
        includeDomains: ["twitter.com"],
        numResults: maxResults,
        text: true,
        summary: true
      }
    );

    console.log('Twitter results sample:', 
      results.results.slice(0, 3).map(r => ({
        text: r.text?.slice(0, 200) + '...',
        url: r.url
      }))
    );

    return results.results.map(result => ({
      text: result.text || '',
      url: result.url || '',
      summary: result.summary || '',
      highlights: []
    }));

  } catch (error) {
    console.error('Twitter search error:', error);
    return [];
  }
}

export async function searchTokenMarketData(address: string) {
  try {
    console.log('Fetching market data for:', address);
    
    // Get Jupiter data first
    const jupiterData = await getTokenPrice(address);
    
    // Try to get Solscan data, but don't fail if unavailable
    let solscanData = null;
    let holderData = null;
    
    try {
      [solscanData, holderData] = await Promise.all([
        getSolscanTokenInfo(address),
        getTopHolders(address)
      ]);
    } catch (error) {
      console.log('Solscan data unavailable:', error);
    }

    if (!jupiterData) {
      console.log('No Jupiter data found for:', address);
      return {
        price_usd: 0,
        market_metrics: {
          liquidity_score: 0,
          confidence: 'low',
          price_impact: { buy: {}, sell: {} },
          last_trade: null,
          price_history: null,
          quoted_prices: null,
          holders: holderData || { total_holders: 0, top_holders: [] },
          token_info: solscanData,
          source: 'jupiter_v2',
          error: 'No price data found'
        }
      };
    }

    const analysis = analyzeLiquidity(jupiterData);
    const priceTrend = calculatePriceTrend(analysis.price_history);

    // Calculate adjusted liquidity score
    const adjustedLiquidityScore = analysis.price_impact.buy['10'] === null ? 
      (analysis.confidence === 'high' ? 70 : analysis.confidence === 'medium' ? 50 : 30) :
      analysis.liquidity_score;

    return {
      price_usd: analysis.price,
      market_metrics: {
        liquidity_score: adjustedLiquidityScore,
        confidence: analysis.confidence,
        price_impact: analysis.price_impact,
        last_trade: analysis.last_trade,
        price_history: analysis.price_history,
        quoted_prices: analysis.quoted_prices,
        price_trend: priceTrend,
        holders: holderData || { total_holders: 0, top_holders: [] },
        token_info: solscanData,
        source: 'jupiter_v2',
        updated_at: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}

export async function searchTokenInfo(address: string) {
  console.log('Starting token info search for:', address);
  
  try {
    // Get market data first
    const marketData = await searchTokenMarketData(address);
    console.log('Market data retrieved:', marketData ? 'success' : 'failed');

    // Basic token info
    const tokenInfo = {
      address: address,
      name: 'Unknown Token', // We'll update this from other sources
      symbol: 'UNKNOWN',
      market_data: marketData,
      last_updated: new Date().toISOString()
    };

    return tokenInfo;
  } catch (error) {
    console.error('Error in searchTokenInfo:', error);
    return null;
  }
}

export async function analyzeTweetSentiment(tweets: any[], tokenAddress: string) {
  if (!tweets.length) return null;

  const tweetTexts = tweets.map(tweet => tweet.text).join('\n\n');
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert at analyzing Solana token sentiment on Twitter. 
        Given a list of tweets about token ${tokenAddress}, analyze:
        1. Overall sentiment (positive, negative, or neutral)
        2. Common themes or topics mentioned
        3. Notable praise or concerns
        4. Level of community engagement
        5. Recent developments or announcements
        6. Market sentiment indicators
        
        Provide your analysis in this JSON format:
        {
          "sentiment": "positive|negative|neutral",
          "summary": "<2-3 sentence overview>",
          "common_themes": ["<list of recurring topics>"],
          "notable_praise": ["<specific positive feedback>"],
          "notable_concerns": ["<specific negative feedback>"],
          "engagement_level": "high|medium|low",
          "market_indicators": ["<relevant trading/price mentions>"]
        }`
      },
      {
        role: "user",
        content: `Analyze these tweets about ${tokenAddress}:\n\n${tweetTexts}`
      }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  if (!content) {
    return null;
  }

  return JSON.parse(content);
}

export async function generateTokenScore(data: {
  twitter_sentiment: any[];
  market_data: SearchResult[];
  token_info: SearchResult[];
}) {
  try {
    const prompt = `Generate a comprehensive analysis for this Solana token based on:

TWITTER ANALYSIS:
${JSON.stringify(data.twitter_sentiment || {}, null, 2)}

MARKET DATA:
${JSON.stringify(data.market_data || [], null, 2)}

TOKEN INFO:
${JSON.stringify(data.token_info || [], null, 2)}

Based on the data above, provide an analysis in this JSON format:
{
  "overall_score": <number 0-100>,
  "summary": "<comprehensive overview>",
  "strengths": ["<specific positive aspects>"],
  "weaknesses": ["<specific negative aspects>"],
  "sources": ["<all URLs referenced>"],
  "market_metrics": {
    "price_trend": "bullish|bearish|neutral",
    "liquidity_assessment": "high|medium|low",
    "trading_volume": "high|medium|low",
    "holder_distribution": "concentrated|distributed"
  },
  "risk_assessment": {
    "level": "low|medium|high",
    "factors": ["<specific risk factors>"]
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a Solana token analyst specializing in technical analysis, on-chain metrics, and social sentiment. Provide detailed analysis in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;
    return JSON.parse(responseText || '{}');

  } catch (error) {
    console.error('Error generating token score:', error);
    return {
      overall_score: 0,
      summary: "Error analyzing token",
      strengths: [],
      weaknesses: [],
      sources: [],
      market_metrics: {},
      risk_assessment: { level: "high", factors: ["Analysis failed"] }
    };
  }
}

