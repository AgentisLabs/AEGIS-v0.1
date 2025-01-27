const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

interface CoinGeckoToken {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
  platforms?: {
    solana?: string;
  };
}

interface CoinGeckoTrendingItem {
  item: {
    id: string;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    small: string;
    large: string;
    price_btc: number;
    score: number;
    platforms?: {
      solana?: string;
    };
  };
}

interface CoinGeckoTrendingResponse {
  coins: CoinGeckoTrendingItem[];
}

export async function getTrendingTokens(limit: number = 10): Promise<CoinGeckoTrendingItem[]> {
  try {
    // First get trending tokens
    const trendingResponse = await fetch(
      `${COINGECKO_BASE_URL}/search/trending`,
      {
        headers: {
          'accept': 'application/json',
        },
        next: { revalidate: 300 }
      }
    );

    if (!trendingResponse.ok) {
      throw new Error('Failed to fetch trending tokens');
    }

    const trendingData = await trendingResponse.json();
    
    // Get platform data for each token to filter Solana tokens
    const platformPromises = trendingData.coins.map(async (token: CoinGeckoTrendingItem) => {
      const coinResponse = await fetch(
        `${COINGECKO_BASE_URL}/coins/${token.item.id}?localization=false&tickers=false&community_data=false&developer_data=false`,
        { next: { revalidate: 300 } }
      );
      if (!coinResponse.ok) return null;
      const coinData = await coinResponse.json();
      return {
        ...token,
        item: {
          ...token.item,
          platforms: coinData.platforms
        }
      };
    });

    const tokensWithPlatforms = await Promise.all(platformPromises);
    
    // Filter for tokens that exist on Solana
    const solanaTokens = tokensWithPlatforms.filter(
      token => token?.item.platforms?.solana
    );

    return solanaTokens.slice(0, limit);

  } catch (error) {
    console.error('Error in getTrendingTokens:', error);
    return [];
  }
} 