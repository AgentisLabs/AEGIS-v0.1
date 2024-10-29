import * as ExaJS from 'exa-js';
import OpenAI from 'openai';
import { TwitterApi } from 'twitter-api-v2';
import { SearchResult } from '../types';

const exa = new ExaJS.default(process.env.EXA_API_KEY!);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

// Initialize the Twitter client with all credentials
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

// Create a read-only client using bearer token
const twitter = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

export async function searchTweets(query: string, maxResults = 100) {
  try {
    const formattedQuery = `${query} -from:${query} lang:en -is:retweet`;
    console.log('Searching Twitter with query:', formattedQuery);

    const tweets = await twitter.v2.search(formattedQuery, {
      max_results: maxResults,
      'tweet.fields': 'created_at,public_metrics,author_id',
      'user.fields': 'name,username,description',
      'expansions': 'author_id'
    });

    // Log a sample of tweets for debugging
    if ((tweets as any)._realData?.data) {
      console.log('Sample of first 3 tweets:', 
        (tweets as any)._realData.data.slice(0, 3).map(t => ({
          text: t.text,
          metrics: t.public_metrics
        }))
      );
    }

    return (tweets as any)._realData?.data?.map(tweet => ({
      text: tweet.text,
      created_at: tweet.created_at,
      public_metrics: tweet.public_metrics,
      author: (tweets as any)._realData.includes?.users?.find(user => user.id === tweet.author_id)
    })) || [];

  } catch (error) {
    console.error('Twitter API Error:', error);
    return [];
  }
}

export async function searchPropFirmInfo(firmName: string): Promise<SearchResult[]> {
  try {
    const result = await exa.searchAndContents(
      firmName,
      {
        type: "keyword",
        category: "company",
        includeDomains: ["propfirmmatch.com"],
        numResults: 5,
        subpages: 2,
        text: true,
        summary: true
      }
    );

    return result.results.map(result => ({
      title: result.title || '',
      url: result.url || '',
      summary: result.summary || result.snippet || '',
      text: result.text || '',
      highlights: result.highlights || []
    }));

  } catch (error) {
    console.error('Error searching prop firm info:', error);
    return [];
  }
}

export async function searchTrustpilotReviews(firmName: string): Promise<SearchResult[]> {
  try {
    const result = await exa.searchAndContents(
      `${firmName} reviews`,
      {
        type: "keyword",
        includeDomains: ["trustpilot.com"],
        numResults: 3,
        subpages: 1,
        text: true,
        summary: true
      }
    );

    return result.results.map(result => ({
      title: result.title || '',
      url: result.url || '',
      summary: result.summary || result.snippet || '',
      text: result.text || '',
      highlights: result.highlights || []
    }));

  } catch (error) {
    console.error('Error searching Trustpilot reviews:', error);
    return [];
  }
}

export async function analyzeTweetSentiment(tweets: any[], firmName: string) {
  if (!tweets.length) return null;

  const tweetTexts = tweets.map(tweet => tweet.text).join('\n\n');
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: [
      {
        role: "system",
        content: `You are an expert at analyzing prop trading firm sentiment on Twitter. 
        Given a list of tweets about ${firmName}, analyze:
        1. Overall sentiment (positive, negative, or neutral)
        2. Common themes or topics mentioned
        3. Notable praise or complaints
        4. Level of engagement
        
        Provide your analysis in this JSON format:
        {
          "sentiment": "positive|negative|neutral",
          "summary": "<2-3 sentence overview>",
          "common_themes": ["<list of recurring topics>"],
          "notable_praise": ["<specific positive feedback>"],
          "notable_complaints": ["<specific negative feedback>"],
          "engagement_level": "high|medium|low"
        }`
      },
      {
        role: "user",
        content: `Analyze these tweets about ${firmName}:\n\n${tweetTexts}`
      }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

interface AnalysisData {
  twitter_sentiment?: TwitterData;
  prop_firm_info?: SearchResult[];
  trustpilot_reviews?: SearchResult[];
}

export async function generateFirmScore(data: AnalysisData) {
  try {
    const prompt = `Generate a comprehensive analysis for this prop trading firm based on:

TWITTER ANALYSIS:
${JSON.stringify(data.twitter_sentiment || {}, null, 2)}

PROP FIRM INFO:
${JSON.stringify(data.prop_firm_info || [], null, 2)}

TRUSTPILOT REVIEWS:
${JSON.stringify(data.trustpilot_reviews || [], null, 2)}

Based on the data above, provide an analysis in this JSON format:
{
  "overall_score": <number 0-100>,
  "summary": "<comprehensive overview>",
  "strengths": ["<specific positive aspects>"],
  "weaknesses": ["<specific negative aspects>"],
  "sources": ["<all URLs referenced>"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "You are a prop firm analyst. Provide detailed analysis in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;
    return JSON.parse(responseText || '{}');

  } catch (error) {
    console.error('Error generating firm score:', error);
    return {
      overall_score: 0,
      summary: "Error analyzing firm",
      strengths: [],
      weaknesses: [],
      sources: []
    };
  }
}
export async function searchPropFirmMatch(query: string) {
  try {
    const urls = [
      `https://www.propfirmmatch.com/prop-firms/${query.toLowerCase()}`,
      `https://www.propfirmmatch.com/blog/${query.toLowerCase()}-review-2023-proprietary-trading-and-beyond`
    ];

    const results = await Promise.all(urls.map(async (url) => {
      try {
        const response = await fetch(url);
        const html = await response.text();
        
        // Use regex or a parser like cheerio to extract content
        const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
        const contentMatch = html.match(/<article[^>]*>(.*?)<\/article>/is);
        
        return {
          title: titleMatch ? titleMatch[1] : '',
          summary: contentMatch ? 
            contentMatch[1]
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/\s+/g, ' ')    // Normalize whitespace
              .trim()
              .slice(0, 1000)          // Limit length
            : '',
          url: url
        };
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return null;
      }
    }));

    return results.filter(result => result !== null);
  } catch (error) {
    console.error('PropFirmMatch search error:', error);
    return [];
  }
}

export async function searchTrustpilot(query: string) {
  try {
    const url = `https://www.trustpilot.com/review/${query.toLowerCase()}.com`;
    const response = await fetch(url);
    const html = await response.text();

    // Extract reviews
    const reviewsMatch = html.match(/<div class="review-content">(.*?)<\/div>/gs);
    const reviews = reviewsMatch ? reviewsMatch.map(review => {
      const textMatch = review.match(/<p[^>]*>(.*?)<\/p>/s);
      const ratingMatch = review.match(/data-rating="(\d)"/);
      
      return {
        text: textMatch ? 
          textMatch[1]
            .replace(/<[^>]*>/g, '')
            .trim() 
          : '',
        rating: ratingMatch ? parseInt(ratingMatch[1]) : 0
      };
    }) : [];

    return [{
      title: `Trustpilot Reviews for ${query}`,
      summary: `Average rating: ${
        reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
      }. Recent reviews: ${
        reviews.slice(0, 3).map(rev => rev.text).join(' | ')
      }`,
      url: url
    }];
  } catch (error) {
    console.error('Trustpilot search error:', error);
    return [];
  }
}

