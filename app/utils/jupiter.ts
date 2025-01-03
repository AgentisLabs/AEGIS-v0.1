interface JupiterPriceResponse {
  data: {
    [key: string]: {
      id: string;
      type: 'derivedPrice';
      price: string;
      extraInfo?: {
        lastSwappedPrice: {
          lastJupiterSellAt: number;
          lastJupiterSellPrice: string;
          lastJupiterBuyAt: number;
          lastJupiterBuyPrice: string;
        };
        quotedPrice: {
          buyPrice: string;
          buyAt: number;
          sellPrice: string;
          sellAt: number;
        };
        confidenceLevel: 'high' | 'medium' | 'low';
        depth: {
          buyPriceImpactRatio: {
            depth: {
              '10': number;
              '100': number;
              '1000': number;
            };
            timestamp: number;
          };
          sellPriceImpactRatio: {
            depth: {
              '10': number;
              '100': number;
              '1000': number;
            };
            timestamp: number;
          };
        };
      };
    };
  };
  timeTaken: number;
}

export async function getTokenPrice(tokenAddress: string): Promise<JupiterPriceResponse | null> {
  try {
    const response = await fetch(
      `https://api.jup.ag/price/v2?ids=${tokenAddress}&showExtraInfo=true`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.status}`);
    }

    const data: JupiterPriceResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching Jupiter price:', error);
    return null;
  }
}

export function analyzeLiquidity(priceData: JupiterPriceResponse) {
  const tokenData = Object.values(priceData.data)[0];
  if (!tokenData?.extraInfo) {
    return {
      price: 0,
      price_history: null,
      liquidity_score: 0,
      confidence: 'low',
      price_impact: { buy: {}, sell: {} },
      last_trade: null
    };
  }

  const { extraInfo } = tokenData;
  const { depth, confidenceLevel, lastSwappedPrice, quotedPrice } = extraInfo;
  
  // Calculate average price impact across different depths
  const buyImpacts = depth.buyPriceImpactRatio.depth;
  const sellImpacts = depth.sellPriceImpactRatio.depth;

  // Calculate liquidity score (0-100)
  const avgImpact = (
    Object.values(buyImpacts).reduce((a, b) => a + b, 0) / 3 +
    Object.values(sellImpacts).reduce((a, b) => a + b, 0) / 3
  ) / 2;

  // Convert impact to score (lower impact = higher score)
  const liquidityScore = Math.max(0, Math.min(100, 100 - (avgImpact * 100)));

  return {
    price: parseFloat(tokenData.price),
    price_history: {
      last_sell: {
        price: parseFloat(lastSwappedPrice.lastJupiterSellPrice),
        timestamp: lastSwappedPrice.lastJupiterSellAt
      },
      last_buy: {
        price: parseFloat(lastSwappedPrice.lastJupiterBuyPrice),
        timestamp: lastSwappedPrice.lastJupiterBuyAt
      }
    },
    quoted_prices: {
      buy: {
        price: parseFloat(quotedPrice.buyPrice),
        timestamp: quotedPrice.buyAt
      },
      sell: {
        price: parseFloat(quotedPrice.sellPrice),
        timestamp: quotedPrice.sellAt
      }
    },
    liquidity_score: liquidityScore,
    confidence: confidenceLevel,
    price_impact: {
      buy: buyImpacts,
      sell: sellImpacts
    },
    last_trade: Math.max(
      lastSwappedPrice.lastJupiterSellAt,
      lastSwappedPrice.lastJupiterBuyAt
    )
  };
} 