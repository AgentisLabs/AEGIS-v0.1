import * as ExaJS from 'exa-js';
import OpenAI from 'openai';
import { SearchResult } from '../types';
import { getTokenPrice, analyzeLiquidity } from './jupiter';

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

// Birdeye rate limiting
let lastBirdeyeCall = 0;
const BIRDEYE_RATE_LIMIT_MS = 2000; // 2 seconds between calls for standard plan
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const cache = new Map();

export async function getBirdeyeTokenInfo(address: string) {
  try {
    // Check rate limit
    const now = Date.now();
    if (now - lastBirdeyeCall < BIRDEYE_RATE_LIMIT_MS) {
      const waitTime = BIRDEYE_RATE_LIMIT_MS - (now - lastBirdeyeCall);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastBirdeyeCall = Date.now();

    const response = await fetch(`https://public-api.birdeye.so/defi/token_overview?address=${address}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'x-chain': 'solana',
        'x-api-key': process.env.BIRDEYE_API_KEY || ''
      }
    });

    if (!response.ok) {
      console.error('Birdeye response status:', response.status);
      console.error('Birdeye response text:', await response.text());
      throw new Error(`Birdeye API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Birdeye API response:', data);

    return {
      holders: data.data?.holderCount || 0,
      volume_24h: data.data?.v24hUSD || 0,
      socials: [
        ...(data.data?.extensions?.twitter ? [{
          platform: 'Twitter',
          url: data.data.extensions.twitter
        }] : []),
        ...(data.data?.extensions?.discord ? [{
          platform: 'Discord',
          url: data.data.extensions.discord
        }] : []),
        ...(data.data?.extensions?.telegram ? [{
          platform: 'Telegram',
          url: data.data.extensions.telegram
        }] : [])
      ],
      websites: data.data?.extensions?.website ? [{ 
        url: data.data.extensions.website 
      }] : []
    };

  } catch (error) {
    console.error('Birdeye API error:', error);
    return {
      holders: 0,
      volume_24h: 0,
      socials: [],
      websites: []
    };
  }
}

// DexScreener rate limiting
let lastDexScreenerCall = 0;
const DEXSCREENER_RATE_LIMIT_MS = 200; // 300 requests per minute = 1 request per 200ms

export async function getDexScreenerTokenInfo(address: string) {
  try {
    // Check rate limit
    const now = Date.now();
    if (now - lastDexScreenerCall < DEXSCREENER_RATE_LIMIT_MS) {
      const waitTime = DEXSCREENER_RATE_LIMIT_MS - (now - lastDexScreenerCall);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastDexScreenerCall = Date.now();

    // DexScreener doesn't require an API key
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DexScreener error response:', errorText);
      return {
        volume_24h: 0,
        liquidity_usd: 0,
        price_usd: 0,
        fdv: 0,
        marketCap: 0,
        pairCreatedAt: null,
        price_change: {
          h1: 0,
          h4: 0,
          h24: 0
        },
        socials: [],
        websites: []
      };
    }

    const data = await response.json();
    
    // Get only the most relevant pair
    const relevantPair = data.pairs?.sort((a, b) => 
      (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
    )[0];

    if (!relevantPair) {
      return {
        volume_24h: 0,
        liquidity_usd: 0,
        price_usd: 0,
        fdv: 0,
        marketCap: 0,
        pairCreatedAt: null,
        price_change: {
          h1: 0,
          h4: 0,
          h24: 0
        },
        socials: [],
        websites: []
      };
    }
    
    // Calculate price trend based on 24h change
    const priceChange24h = parseFloat(relevantPair.priceChange?.h24 || '0');
    const priceTrend = {
      price_change_24h: priceChange24h,
      price_trend: priceChange24h > 0 ? 'up' : priceChange24h < 0 ? 'down' : 'neutral'
    };
    
    return {
      volume_24h: parseFloat(relevantPair.volume?.h24 || '0'),
      liquidity_usd: relevantPair.liquidity?.usd || 0,
      price_usd: parseFloat(relevantPair.priceUsd || '0'),
      fdv: relevantPair.fdv || 0,
      marketCap: relevantPair.marketCap || 0,
      pairCreatedAt: relevantPair.pairCreatedAt || null,
      dex: relevantPair.dexId,
      pair_address: relevantPair.pairAddress,
      price_trend: priceTrend,
      price_change: {
        h1: parseFloat(relevantPair.priceChange?.h1 || '0'),
        h4: parseFloat(relevantPair.priceChange?.h4 || '0'),
        h24: parseFloat(relevantPair.priceChange?.h24 || '0')
      },
      socials: relevantPair.links?.map(link => ({
        platform: link.name,
        url: link.url
      })) || [],
      websites: [{
        url: relevantPair.links?.find(link => link.name === 'website')?.url || ''
      }],
      base_token: {
        symbol: relevantPair.baseToken?.symbol,
        name: relevantPair.baseToken?.name
      },
      quote_token: {
        symbol: relevantPair.quoteToken?.symbol,
        name: relevantPair.quoteToken?.name
      }
    };

  } catch (error) {
    console.error('DexScreener API error:', error);
    return {
      volume_24h: 0,
      liquidity_usd: 0,
      price_usd: 0,
      fdv: 0,
      marketCap: 0,
      pairCreatedAt: null,
      price_change: {
        h1: 0,
        h4: 0,
        h24: 0
      },
      socials: [],
      websites: []
    };
  }
}

export async function searchGMGNInfo(address: string): Promise<SearchResult[]> {
  try {
    console.log(`Searching GMGN.ai for: ${address}`);
    const result = await exa.searchAndContents(
      `${address}`,
      {
        type: "keyword",
        includeDomains: ["gmgn.ai"],
        numResults: 1,
        subpages: 2,
        text: true,
        summary: true,
        useCustomParser: true,
        javascript: true,
        waitForSelector: '.token-info',
        selectors: [
          '.token-info',
          '.token-stats',
          '.token-holders',
          'div[class*="holder"]',
          'div[class*="stats"]'
        ],
        timeout: 10000
      }
    );

    console.log('GMGN.ai results:', 
      result.results.slice(0, 2).map(r => ({
        title: r.title,
        url: r.url,
        summary: r.summary?.slice(0, 200) + '...'
      }))
    );

    // Extract holder count from the text content
    const holderPatterns = [
      /Holders:\s*([,\d]+)/i,
      /(\d+[,\d]*)\s+holders/i,
      /holder count:\s*(\d+[,\d]*)/i,
      /total holders:\s*(\d+[,\d]*)/i,
      /holders\s*(\d+[,\d]*)/i
    ];

    let holders = 0;
    for (const result of result.results) {
      const text = result.text || '';
      for (const pattern of holderPatterns) {
        const match = text.match(pattern);
        if (match) {
          holders = parseInt(match[1].replace(/,/g, ''));
          break;
        }
      }
      if (holders > 0) break;
    }

    return result.results.map(result => ({
      title: result.title || '',
      url: result.url || '',
      summary: result.summary || '',
      text: result.text || '',
      highlights: [],
      holders: holders
    }));

  } catch (error) {
    console.error('Error searching GMGN info:', error);
    return [];
  }
}

export async function searchBirdeyeInfo(address: string): Promise<SearchResult[]> {
  try {
    console.log(`Searching Birdeye for: ${address}`);
    
    // Clean the URL format - remove any trailing characters and ensure proper format
    const searchUrl = `https://birdeye.so/token/${address.trim()}?chain=solana`;
    console.log('Attempting to scrape URL:', searchUrl);
    
    const searchResults = await exa.searchAndContents(
      searchUrl,
      {
        type: "auto",  // Use URL type for exact page
        includeDomains: ["birdeye.so"],
        numResults: 1,
        text: true,
        summary: true,
        useCustomParser: true,
        javascript: true,
        waitForSelector: '.token-info',
        selectors: [
          // More specific selectors based on Birdeye's UI
          'div[class*="TokenInfo"]',
          'div[class*="Holders"]',
          'div[class*="MarketStats"]',
          'div[class*="holder"]',
          'div[class*="stats"]',
          'div[class*="liquidity"]',
          'div[class*="volume"]',
          'div[class*="supply"]'
        ],
        timeout: 15000,
        renderType: 'html',
        subpages: 0  // Don't follow any links
      }
    );

    console.log('Raw Birdeye response:', searchResults);
    
    // Extract holder count from the text content
    const text = searchResults.results[0]?.text || '';
    console.log('Extracted text content:', text.slice(0, 500)); // Log first 500 chars

    let holders = 0;
    const holderPatterns = [
      /Holders:\s*(\d+\.?\d*[kKmMbB]?)/i,
      /(\d+\.?\d*[kKmMbB]?)\s*holders/i,
      /holder count:\s*(\d+\.?\d*[kKmMbB]?)/i,
      /total holders:\s*(\d+\.?\d*[kKmMbB]?)/i,
      /holders\s*(\d+\.?\d*[kKmMbB]?)/i
    ];

    for (const pattern of holderPatterns) {
      const match = text.match(pattern);
      if (match) {
        const value = match[1].toLowerCase();
        if (value.endsWith('k')) {
          holders = parseFloat(value) * 1000;
        } else if (value.endsWith('m')) {
          holders = parseFloat(value) * 1000000;
        } else if (value.endsWith('b')) {
          holders = parseFloat(value) * 1000000000;
        } else {
          holders = parseInt(value.replace(/,/g, ''));
        }
        console.log('Found holder count:', holders, 'from pattern:', pattern);
        break;
      }
    }

    return [{
      title: 'Birdeye Token Info',
      url: searchUrl,  // Use the clean URL
      summary: text.slice(0, 200),
      text: text,
      highlights: [],
      holders: holders
    }];

  } catch (error) {
    console.error('Error searching Birdeye info:', error);
    return [];
  }
}

export async function getSolscanTokenInfo(address: string) {
  try {
    console.log('Fetching Birdeye data for:', address);
    
    const results = await searchBirdeyeInfo(address);
    console.log('Birdeye search results:', results);

    return {
      holders: results[0]?.holders || 0
    };

  } catch (error) {
    console.error('Error fetching Birdeye data:', error);
    return {
      holders: 0
    };
  }
}

export async function searchTokenMarketData(address: string) {
  try {
    console.log('Fetching market data for:', address);
    
    // Get DexScreener data only
    const dexScreenerData = await getDexScreenerTokenInfo(address);
    
    console.log('DexScreener Data:', dexScreenerData);

    return {
      price_usd: dexScreenerData?.price_usd || 0,
      market_metrics: {
        liquidity_score: dexScreenerData?.liquidity_usd ? 
          Math.min(100, Math.log10(dexScreenerData.liquidity_usd) * 10) : 0,
        price_trend: dexScreenerData?.price_trend,
        liquidity_usd: dexScreenerData?.liquidity_usd || 0,
        volume_24h: dexScreenerData?.volume_24h || 0,
        marketCap: dexScreenerData?.marketCap || 0,
        fdv: dexScreenerData?.fdv || 0,
        pairCreatedAt: dexScreenerData?.pairCreatedAt || null,
        holders: 0, // Remove Solscan/Birdeye holder count
        socials: dexScreenerData?.socials || [],
        websites: dexScreenerData?.websites || []
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
    model: "gpt-4o-mini",
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
      model: "gpt-4o-mini",
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

