const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';

interface TrendingTokenResponse {
  success: boolean;
  data: {
    updateUnixTime: number;
    updateTime: string;
    tokens: TrendingToken[];
    total: number;
  };
}

interface TrendingToken {
  address: string;
  decimals: number;
  liquidity: number;
  logoURI: string;
  name: string;
  symbol: string;
  volume24hUSD: number;
  rank: number;
}

export async function getTrendingTokens(
  limit: number = 10,
  sortBy: 'rank' | 'liquidity' | 'volume24hUSD' = 'rank',
  sortType: 'asc' | 'desc' = 'asc'
): Promise<TrendingToken[]> {
  try {
    const response = await fetch(
      `${BIRDEYE_BASE_URL}/defi/token_trending?sort_by=${sortBy}&sort_type=${sortType}&offset=0&limit=${Math.min(limit, 20)}`,
      {
        headers: {
          'X-API-KEY': process.env.BIRDEYE_API_KEY!,
          'x-chain': 'solana',
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch trending tokens');
    }

    const data: TrendingTokenResponse = await response.json();
    
    if (!data.success || !data.data?.tokens) {
      throw new Error('Invalid response format');
    }

    return data.data.tokens;
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    return [];
  }
} 