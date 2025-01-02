import * as ExaJS from 'exa-js';
import OpenAI from 'openai';
import { SearchResult } from '../types';

const exa = new ExaJS.default(process.env.EXA_API_KEY!);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

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
    console.log(`Searching market data for: ${address}`);
    const result = await exa.searchAndContents(
      address,
      {
        type: "keyword",
        includeDomains: ["dexscreener.com", "birdeye.so", "solscan.io"],
        numResults: 5,
        text: true,
        summary: true
      }
    );

    console.log('Market data results:', 
      result.results.slice(0, 2).map(r => ({
        title: r.title,
        url: r.url,
        summary: r.summary?.slice(0, 200) + '...'
      }))
    );

    return result.results.map(result => ({
      title: result.title || '',
      url: result.url || '',
      summary: result.summary || '',
      text: result.text || '',
      highlights: []
    }));

  } catch (error) {
    console.error('Error searching market data:', error);
    return [];
  }
}

export async function searchTokenInfo(address: string): Promise<SearchResult[]> {
  try {
    console.log(`Searching token info for: ${address}`);
    const result = await exa.searchAndContents(
      address,
      {
        type: "keyword",
        includeDomains: ["gmgn.ai", "rugcheck.xyz"],
        numResults: 3,
        text: true,
        summary: true
      }
    );

    console.log('Token info results:', 
      result.results.slice(0, 2).map(r => ({
        title: r.title,
        url: r.url,
        summary: r.summary?.slice(0, 200) + '...'
      }))
    );

    return result.results.map(result => ({
      title: result.title || '',
      url: result.url || '',
      summary: result.summary || '',
      text: result.text || '',
      highlights: []
    }));

  } catch (error) {
    console.error('Error searching token info:', error);
    return [];
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

