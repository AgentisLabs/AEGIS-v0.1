import * as ExaJS from 'exa-js';
import OpenAI from 'openai';
import { TwitterApi } from 'twitter-api-v2';

const exa = new ExaJS.default(process.env.EXA_API_KEY!);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

const twitter = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

export async function searchTweets(query: string, maxResults = 100) {
  try {
    const formattedQuery = query.replace(/"/g, '').trim();
    console.log('Searching Twitter with query:', formattedQuery);
    
    const tweets = await twitter.v2.search(formattedQuery, {
      max_results: Math.min(maxResults, 100),
      expansions: ['author_id'],
      'tweet.fields': ['created_at', 'public_metrics', 'text'],
      'user.fields': ['username', 'name', 'description']
    });

    // Extract tweets from the paginator response
    if (tweets._realData?.data) {
      const formattedTweets = tweets._realData.data.map(tweet => ({
        text: tweet.text,
        created_at: tweet.created_at,
        public_metrics: tweet.public_metrics,
        author: tweets._realData.includes?.users?.find(user => user.id === tweet.author_id)
      }));

      console.log('Number of tweets found:', formattedTweets.length);
      return formattedTweets;
    }

    console.log('No tweets found or invalid response structure');
    return [];

  } catch (error) {
    if (error instanceof Error) {
      console.error('Twitter API error:', error.message);
      console.error('Error details:', error);
    } else {
      console.error('Unexpected error:', error);
    }
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
  if (!tweets.length) return "No social media presence found.";

  const tweetTexts = tweets.map(tweet => tweet.text).join('\n\n');
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: [
      {
        role: "system",
        content: `You are an agent that analyzes Twitter sentiment for proprietary trading firms.
        Given a list of tweets about a specific firm, analyze the overall sentiment and provide a summary.
        Consider the following:
        1. Overall sentiment (positive, negative, or neutral)
        2. Common themes or topics mentioned
        3. Any notable praise or complaints
        4. Level of engagement (replies, retweets, likes)
        
        Provide your analysis in this exact JSON format:
        {
          "sentiment_score": <number 0-100>,
          "summary": "<2-3 sentence overview>",
          "key_points": ["<point 1>", "<point 2>", "<point 3>"]
        }`
      },
      {
        role: "user",
        content: `Analyze these tweets about ${firmName}:\n\n${tweetTexts}`
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  try {
    return JSON.parse(response.choices[0].message.content.trim());
  } catch (error) {
    console.error('Failed to parse sentiment analysis:', error);
    return {
      sentiment_score: 0,
      summary: "Error analyzing tweets",
      key_points: []
    };
  }
}

export async function generateFirmScore(data: {
  twitter_sentiment?: any[];
  prop_firm_info?: any;
  trustpilot_reviews?: any;
}) {
  try {
    // Format tweet data for better analysis
    const tweetSummary = data.twitter_sentiment?.map(tweet => ({
      text: tweet.text,
      metrics: tweet.public_metrics,
      created_at: tweet.created_at
    }));

    const prompt = `Analyze this prop trading firm data and provide a detailed report card.
      
      Social Media Presence: ${tweetSummary ? JSON.stringify(tweetSummary) : 'No tweets found'}
      Number of Tweets: ${tweetSummary?.length || 0}
      PropFirmMatch Info: ${data.prop_firm_info ? JSON.stringify(data.prop_firm_info) : 'No data'}
      Trustpilot Reviews: ${data.trustpilot_reviews ? JSON.stringify(data.trustpilot_reviews) : 'No data'}
      
      Consider the following in your analysis:
      1. Tweet engagement metrics (likes, retweets, replies)
      2. Sentiment of social media discussions
      3. Presence on professional platforms
      4. User reviews and feedback`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "You are a prop firm analyst. You must respond with ONLY a JSON object in this exact format, with no additional text or formatting: { \"overall_score\": <number between 0-100>, \"summary\": \"<3-4 sentence overview>\", \"strengths\": [\"<strength 1>\", \"<strength 2>\"], \"weaknesses\": [\"<weakness 1>\", \"<weakness 2>\"], \"sources\": [\"<source 1>\", \"<source 2>\", \"<source 3>\"] }"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    try {
      const result = JSON.parse(completion.choices[0].message.content.trim());
      console.log('Generated analysis:', result);
      return result;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return {
        overall_score: 0,
        summary: "Error analyzing firm",
        strengths: [],
        weaknesses: [],
        sources: []
      };
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
