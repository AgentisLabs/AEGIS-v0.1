'use client';

import { useState, useEffect } from 'react';
import { History, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JupiterSwapTool } from '@/app/lib/tools/jupiter-swap';
import { useWallet } from '@solana/wallet-adapter-react';

interface TrendingToken {
  address: string;
  marketData: {
    liquidity_usd: number;
    volume_24h: number;
    price_trend: {
      price_change_24h: number;
    };
  } | null;
  name: string;
  symbol: string;
  price_usd: number;
  search_count: number;
  last_searched: string;
}

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

interface TrendingTokensProps {
  onAnalyze: (address: string) => void;
}

export default function TrendingTokens({ onAnalyze }: TrendingTokensProps) {
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [buyingToken, setBuyingToken] = useState<string | null>(null);
  const wallet = useWallet();
  const jupiterSwap = new JupiterSwapTool();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/trending');
        const data = await response.json();
        setTokens(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTokenClick = (e: React.MouseEvent, address: string) => {
    e.preventDefault();
    onAnalyze(address);
  };

  const handleQuickBuy = async (token: TrendingToken) => {
    if (!wallet.connected) {
      console.log('Please connect your wallet first');
      return;
    }

    setBuyingToken(token.address);
    try {
      const response = await jupiterSwap.execute({
        inputToken: 'So11111111111111111111111111111111111111112',
        outputToken: token.address,
        amount: 0.25 * 1e9,
        slippage: 1
      }, {
        wallet: wallet as any
      });

      if (response.success) {
        console.log('Swap successful:', response.data);
      } else {
        console.error('Swap failed:', response.error);
      }
    } catch (error) {
      console.error('Error executing swap:', error);
    } finally {
      setBuyingToken(null);
    }
  };

  const sortedTokens = [...tokens].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.search_count - a.search_count;
    }
    return new Date(b.last_searched).getTime() - new Date(a.last_searched).getTime();
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-gray-900/50 rounded-xl backdrop-blur-sm">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800/50 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          {sortBy === 'recent' ? (
            <History className="w-5 h-5 text-blue-400" />
          ) : (
            <TrendingUp className="w-5 h-5 text-blue-400" />
          )}
          <h2 className="text-xl font-semibold text-gray-200">
            {sortBy === 'recent' ? 'Recent Searches' : 'Most Searched'}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy('recent')}
            className={cn(
              "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
              sortBy === 'recent' 
                ? "bg-blue-500/20 text-blue-400" 
                : "text-gray-400 hover:text-gray-200"
            )}
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={cn(
              "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
              sortBy === 'popular' 
                ? "bg-blue-500/20 text-blue-400" 
                : "text-gray-400 hover:text-gray-200"
            )}
          >
            Most Searched
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedTokens.map((token, index) => (
          <div
            key={token.address}
            onClick={(e) => handleTokenClick(e, token.address)}
            className="cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center 
                      justify-between p-4 bg-gray-900/50 rounded-xl backdrop-blur-sm 
                      border border-gray-800/50 hover:border-blue-500/20 
                      transition-all duration-300 gap-4"
          >
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <span className="text-gray-400 text-sm min-w-[24px]">#{index + 1}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-200">
                    {token.symbol.toUpperCase()}
                  </span>
                  {sortBy === 'popular' && (
                    <span className="text-xs text-gray-400">
                      {token.search_count} searches
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{token.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <div className="font-medium text-gray-200">
                  ${token.price_usd.toFixed(6)}
                </div>
                <div className={cn(
                  "text-sm",
                  (token.marketData?.price_trend?.price_change_24h || 0) >= 0 
                    ? "text-green-400" 
                    : "text-red-400"
                )}>
                  {(token.marketData?.price_trend?.price_change_24h || 0) >= 0 ? "+" : ""}
                  {token.marketData?.price_trend?.price_change_24h?.toFixed(2)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">24h Volume</div>
                <div className="font-medium text-gray-200">
                  ${formatNumber(token.marketData?.volume_24h || 0)}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickBuy(token);
                }}
                disabled={buyingToken === token.address}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                  buyingToken === token.address
                    ? "bg-gray-800/50 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                )}
              >
                {buyingToken === token.address ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "Buy 0.25 SOL"
                )}
              </button>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 