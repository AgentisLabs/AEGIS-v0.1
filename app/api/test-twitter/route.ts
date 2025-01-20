import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

console.log('Route file loaded');

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

export async function GET(request: NextRequest) {
  try {
    console.log('Starting test tweet...');
    
    const bootMessage = `🤖 AEGIS Initializing...

Neural networks: Online
Market analysis modules: Active
Sentiment tracking: Enabled
Meme detection: Maximum sensitivity

Status: Ready to analyze

[${new Date().toLocaleTimeString()}]`;
    
    const tweet = await client.v2.tweet({
      text: bootMessage
    });

    console.log('Tweet posted successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Test tweet posted successfully',
      tweetId: tweet.data.id,
      tweetUrl: `https://twitter.com/i/web/status/${tweet.data.id}`
    });
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: error.stack
      }, 
      { status: 500 }
    );
  }
}

// Add POST method to match pattern of other routes
export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
} 