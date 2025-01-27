const DEX_SCREENER_BASE_URL = 'https://api.dexscreener.com/latest/dex';

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd: string;
  priceNative: string;
  liquidity?: {
    usd: number;
  };
  volume?: {
    h24: number;
  };
  priceChange?: {
    h24: number;
  };
  marketCap?: number;
}

export async function getTrendingTokens(limit: number = 10): Promise<DexScreenerPair[]> {
  try {
    console.log('Fetching trending tokens...');
    
    const response = await fetch(
      `${DEX_SCREENER_BASE_URL}/search?q=solana`,
      {
        headers: {
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('API Response not OK:', response.status, response.statusText);
      throw new Error('Failed to fetch trending tokens');
    }

    const data = await response.json();

    if (!data.pairs || !Array.isArray(data.pairs)) {
      console.error('Invalid data format:', data);
      throw new Error('Invalid response format');
    }

    // Filter for Solana pairs with specific criteria
    const solanaPairs = data.pairs
      .filter((pair: DexScreenerPair) => {
        // Basic requirements
        if (!pair.chainId === 'solana' || 
            !pair.baseToken?.symbol || 
            !pair.volume?.h24) return false;

        // Exclude wrapped SOL and common tokens
        const symbol = pair.baseToken.symbol.toLowerCase();
        if (['wsol', 'sol', 'usdc', 'usdt'].includes(symbol)) return false;

        // Market cap filters (exclude high market cap tokens)
        if (pair.marketCap && pair.marketCap > 10000000) return false; // Max 10M market cap

        // Volume requirements
        if (pair.volume.h24 < 1000) return false; // Minimum $1000 24h volume

        // Liquidity requirements
        if (!pair.liquidity?.usd || pair.liquidity.usd < 1000) return false; // Minimum $1000 liquidity

        return true;
      })
      .sort((a: DexScreenerPair, b: DexScreenerPair) => 
        (b.volume?.h24 || 0) - (a.volume?.h24 || 0)
      )
      .slice(0, limit);

    console.log('Filtered Solana pairs:', solanaPairs);
    return solanaPairs;

  } catch (error) {
    console.error('Error in getTrendingTokens:', error);
    return [];
  }
} 