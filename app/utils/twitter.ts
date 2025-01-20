import { TwitterApi } from 'twitter-api-v2';
import { TokenAnalysis } from '@/app/types';

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

function formatNumber(num: number): string {
  if (!num) return '0';
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(2);
}

function getSentiment(score: number): string {
  if (score >= 80) return "Very Bullish 🚀";
  if (score >= 60) return "Bullish 📈";
  if (score >= 40) return "Neutral ⚖️";
  if (score >= 20) return "Bearish 📉";
  return "Very Bearish 🔻";
}

export async function postAnalysisToTwitter(analysis: TokenAnalysis): Promise<string> {
  try {
    const symbol = analysis.market_data?.market_metrics?.pair?.base_token?.symbol || 'Unknown';
    const priceChange = analysis.market_data?.market_metrics?.price_trend?.price_change_24h || 0;
    const marketCap = analysis.market_data?.market_metrics?.marketCap || 0;
    const overallScore = analysis.overall_score || 0;
    const sentiment = analysis.social_metrics?.sentiment_score || 0;

    const tweetText = `🤖 AEGIS Analysis: $${symbol}

CA: ${analysis.address}

💰 Market Cap: $${formatNumber(marketCap)}
📊 24h Change: ${priceChange.toFixed(2)}%

🎯 Overall Score: ${overallScore}/100
🌐 Social Sentiment: ${getSentiment(sentiment)}

Recommendation: ${overallScore >= 70 ? "Buy 🚀" : overallScore >= 50 ? "Has Potential 👍" : "DYOR 🔍"}

agentis.sh/token/${analysis.address}`;

    const tweet = await client.v2.tweet({
      text: tweetText
    });

    console.log('Analysis posted to Twitter:', tweet.data.id);
    return tweet.data.id;
  } catch (error) {
    console.error('Error posting to Twitter:', error);
    throw error;
  }
} 