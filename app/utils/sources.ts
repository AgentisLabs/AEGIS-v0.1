import * as ExaJS from 'exa-js';
import OpenAI from 'openai';
import { TwitterApi } from 'twitter-api-v2';

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
    if (tweets._realData?.data) {
      console.log('Sample of first 3 tweets:', 
        tweets._realData.data.slice(0, 3).map(t => ({
          text: t.text,
          metrics: t.public_metrics
        }))
      );
    }

    return tweets._realData?.data?.map(tweet => ({
      text: tweet.text,
      created_at: tweet.created_at,
      public_metrics: tweet.public_metrics,
      author: tweets._realData.includes?.users?.find(user => user.id === tweet.author_id)
    })) || [];

  } catch (error) {
    console.error('Twitter API Error:', error);
    return [];
  }
}

export async function searchPropFirmInfo(firmName: string, numResults = 5) {
  try {
    console.log('Searching PropFirmMatch for:', firmName);
    const query = `site:propfirmmatch.com "${firmName}"`;
    
    const searchResults = await exa.search(query, {
      numResults,
      type: "keyword",
      startPublishedDate: "2023-01-01",
      summary: true,
      summaryNumSentences: 3,
      useAuthorDate: true,
      highlights: true
    });
    
    if (!searchResults?.results?.length) {
      return null;
    }

    return searchResults.results.map(result => ({
      title: result.title,
      url: result.url,
      summary: result.summary || result.text?.substring(0, 200),
      highlights: result.highlights,
      publishedDate: result.publishedDate
    }));
    
  } catch (error) {
    console.error('PropFirmMatch search error:', error);
    return null;
  }
}

export async function searchTrustpilotReviews(firmName: string, numResults = 3) {
  try {
    console.log('Searching Trustpilot for:', firmName);
    const query = `site:trustpilot.com/review "${firmName}"`;
    
    const searchResults = await exa.search(query, {
      numResults,
      type: "keyword",
      startPublishedDate: "2023-01-01",
      summary: true,
      summaryNumSentences: 3,
      useAuthorDate: true,
      highlights: true
    });
    
    if (!searchResults?.results?.length) {
      return null;
    }

    return searchResults.results.map(result => ({
      title: result.title,
      url: result.url,
      summary: result.summary || result.text?.substring(0, 200),
      highlights: result.highlights,
      publishedDate: result.publishedDate
    }));
    
  } catch (error) {
    console.error('Trustpilot search error:', error);
    return null;
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
        content: `You are an expert at analyzing prop trading firm sentiment. Analyze these tweets about ${firmName} focusing ONLY on user experiences and feedback.
        
        Key areas to analyze:
        1. Withdrawal experiences (speed, reliability)
        2. Customer support quality
        3. Platform stability and technical issues
        4. Challenge/verification experiences
        5. Trading conditions (spreads, execution)
        6. Payment/refund issues
        7. Specific complaints or praise
        
        Ignore metrics like likes, retweets, or follower counts. Focus only on the actual content and experiences shared.
        
        Provide your analysis in this exact JSON format:
        {
          "sentiment_score": <number 0-100, based on ratio of positive to negative experiences>,
          "summary": "<2-3 sentence overview focusing on most common user experiences>",
          "key_positives": ["<list of specific positive experiences mentioned>"],
          "key_negatives": ["<list of specific complaints or issues mentioned>"],
          "recurring_issues": ["<list of frequently mentioned problems>"],
          "notable_feedback": "<any standout positive or negative experiences worth highlighting>"
        }`
      },
      {
        role: "user",
        content: `Analyze these tweets about ${firmName}:\n\n${tweetTexts}`
      }
    ],
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: "json_object" }
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Failed to parse sentiment analysis:', error);
    return null;
  }
}

export async function generateFirmScore(data: {
  twitter_sentiment?: any;
  prop_firm_info?: any;
  trustpilot_reviews?: any;
}) {
  try {
    // Sanitize and format the data
    const sanitizedData = {
      twitter: data.twitter_sentiment ? {
        summary: data.twitter_sentiment.summary || '',
        positives: Array.isArray(data.twitter_sentiment.key_positives) ? 
          data.twitter_sentiment.key_positives : [],
        negatives: Array.isArray(data.twitter_sentiment.key_negatives) ? 
          data.twitter_sentiment.key_negatives : [],
        recurring_issues: Array.isArray(data.twitter_sentiment.recurring_issues) ? 
          data.twitter_sentiment.recurring_issues : []
      } : null,
      propfirm: data.prop_firm_info ? data.prop_firm_info.map((item: any) => ({
        title: item.title || '',
        summary: item.summary || '',
        url: item.url || ''
      })) : [],
      trustpilot: data.trustpilot_reviews ? data.trustpilot_reviews.map((item: any) => ({
        title: item.title || '',
        summary: item.summary || '',
        url: item.url || ''
      })) : []
    };

    const prompt = `Analyze this prop trading firm data and provide a report card.

Twitter Analysis: ${sanitizedData.twitter ? JSON.stringify(sanitizedData.twitter) : 'No Twitter data available'}

PropFirmMatch Reviews: ${sanitizedData.propfirm.length ? JSON.stringify(sanitizedData.propfirm) : 'No PropFirmMatch data available'}

Trustpilot Reviews: ${sanitizedData.trustpilot.length ? JSON.stringify(sanitizedData.trustpilot) : 'No Trustpilot data available'}

Provide a JSON response with these exact fields:
{
  "overall_score": <number between 0-100>,
  "summary": "<3-4 sentence overview of user experiences>",
  "strengths": ["<specific positive aspects>"],
  "weaknesses": ["<specific negative aspects>"],
  "sources": ["<relevant URLs from the data>"]
}`;

    console.log('Sending prompt to OpenAI:', prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "You are a prop firm analyst. Respond with ONLY a valid JSON object containing the analysis results."
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

    const responseText = completion.choices[0].message.content.trim();
    console.log('OpenAI Response:', responseText);

    try {
      const result = JSON.parse(responseText);
      return result;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Failed to parse analysis results');
    }

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
