import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    
    // Fetch from DexScreener API
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`
    );
    
    const dexData = await response.json();
    
    // Transform DexScreener data to match our market_data structure
    const marketData = {
      market_metrics: {
        pair: {
          base_token: {
            symbol: dexData.pairs?.[0]?.baseToken?.symbol || 'Unknown',
            name: dexData.pairs?.[0]?.baseToken?.name
          },
          quote_token: {
            symbol: dexData.pairs?.[0]?.quoteToken?.symbol
          }
        },
        price_trend: {
          price_trend: dexData.pairs?.[0]?.priceChange?.h24 > 0 ? 'up' : 'down',
          price_change_24h: dexData.pairs?.[0]?.priceChange?.h24
        },
        liquidity_usd: dexData.pairs?.[0]?.liquidity?.usd,
        volume_24h: dexData.pairs?.[0]?.volume?.h24,
        marketCap: dexData.pairs?.[0]?.marketCap
      }
    };

    return NextResponse.json({ data: marketData });
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
} 