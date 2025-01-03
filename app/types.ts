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

export interface TokenAnalysis {
  address: string;
  symbol: string;
  name: string;
  overall_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  sources: string[];
  last_updated: string;
  times_searched: number;
  is_in_leaderboard: boolean;
  
  // Market Data
  market_data?: {
    price_usd: number;
    market_metrics: {
      liquidity_score: number;
      confidence: string;
      price_impact: {
        buy: Record<string, number>;
        sell: Record<string, number>;
      };
      last_trade: number | null;
      price_history: {
        last_buy: {
          price: number;
          timestamp: number;
        };
        last_sell: {
          price: number;
          timestamp: number;
        };
      } | null;
      quoted_prices: {
        buy: {
          price: number;
          timestamp: number;
        };
        sell: {
          price: number;
          timestamp: number;
        };
      } | null;
      holders: number;
      volume_24h: number;
      price_trend: {
        price_trend: 'up' | 'down' | 'neutral';
        price_change_24h: number;
      };
    };
  };

  // Social Data
  social_metrics?: {
    sentiment_score: number;
    mentions_24h: number;
    trending_score: number;
    community_trust: number;
    key_influencers: string[];
  };

  // On-chain Data
  chain_metrics?: {
    total_holders: number;
    active_wallets_24h: number;
    average_transaction: number;
    whale_concentration: number;
    creation_date: string;
  };

  // Analysis Data
  analysis_data?: {
    twitter_data?: SearchResult[];
    gmgn_data?: SearchResult[];
    dex_data?: SearchResult[];
  };
}

export interface TokenMetrics {
  price: number;
  volume_24h: number;
  liquidity: number;
  holders: number;
  market_cap: number;
}
