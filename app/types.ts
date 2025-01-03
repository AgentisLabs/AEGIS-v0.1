export interface ApiResponse<T = unknown> {
  error?: string;
  data?: T;
}

export interface SearchResult {
  title: string;
  url: string;
  summary: string;
  text: string;
  highlights: string[];
}

interface RiskAssessment {
  level: 'extreme' | 'high' | 'medium' | 'low';
  factors: string[];
  liquidity_risk: 'high' | 'medium' | 'low';
  volatility_risk: 'high' | 'medium' | 'low';
  manipulation_risk: 'high' | 'medium' | 'low';
}

interface MarketMetricsAssessment {
  price_trend: 'bullish' | 'bearish' | 'neutral';
  liquidity_assessment: 'high' | 'medium' | 'low';
  trading_volume: 'high' | 'medium' | 'low';
  sustainability: 'sustainable' | 'unsustainable';
}

export interface TokenAnalysis {
  address: string;
  name: string;
  symbol: string;
  market_data: {
    price_usd: number;
    market_metrics: {
      liquidity_score: number;
      price_trend: any;
      liquidity_usd: number;
      volume_24h: number;
      marketCap: number;
      fdv: number;
      pairCreatedAt: number;
      holders: number;
      socials: any[];
      websites: string[];
    };
  };
  social_metrics: {
    sentiment_score: number;
    community_trust: number;
    trending_score: number;
    summary: string;
  };
  last_updated: string;
}

export interface TokenMetrics {
  price: number;
  volume_24h: number;
  liquidity: number;
  holders: number;
  market_cap: number;
}
