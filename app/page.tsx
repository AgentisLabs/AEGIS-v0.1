'use client';

import { useState } from 'react';
import Image from 'next/image';
import SearchBar from './components/SearchBar';
import ReportCard from './components/ReportCard';
import Leaderboard from './components/Leaderboard';
import { TokenAnalysis } from './types';
import ChatBox from './components/ChatBox';
import { BentoGrid, BentoGridItem } from './components/ui/bento-grid';
import { motion } from 'framer-motion';
import { 
  IconGraph, 
  IconBrain,
  IconChartCandle,
  IconCoin
} from "@tabler/icons-react";
import { BentoImage } from './components/ui/bento-image';

// Skeleton component with dot pattern and mask
const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl 
    dark:bg-dot-white/[0.2] bg-dot-black/[0.2] 
    [mask-image:radial-gradient(ellipse_at_center,white,transparent)] 
    border border-transparent dark:border-white/[0.2] 
    bg-neutral-100 dark:bg-black">
  </div>
);

export default function TokenAnalyzer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<TokenAnalysis | null>(null);
  const [leaderboard, setLeaderboard] = useState<TokenAnalysis[]>([]);

  const handleSearch = async (address: string) => {
    setIsLoading(true);
    setError(null);
    
    // Initialize report with loading state
    setCurrentReport({ 
      address,
      loading: true,
      market_data: null,
      summary: "Fetching market data...",
      strengths: [],
      weaknesses: [],
    } as TokenAnalysis);

    try {
      // First fetch: Quick market data from DexScreener
      const marketDataResponse = await fetch('/api/market-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (marketDataResponse.ok) {
        const { data: marketData } = await marketDataResponse.json();
        // Update report with market data while keeping loading true
        setCurrentReport(prev => ({
          ...prev,
          market_data: marketData,
          summary: "Analyzing token...",
          loading: true // Keep loading true for full analysis
        }));
      }

      // Second fetch: Full analysis
      const analysisResponse = await fetch('/api/analyze-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (!analysisResponse.ok) {
        const error = await analysisResponse.json();
        throw new Error(error.error || 'Failed to analyze token');
      }

      const { data } = await analysisResponse.json();
      // Preserve the market data we already have if the full analysis doesn't include it
      setCurrentReport(prev => ({ 
        ...data, 
        market_data: data.market_data || prev?.market_data,
        loading: false 
      }));

      // Update leaderboard if high score
      if (data.overall_score > 70) {
        setLeaderboard(prev => {
          const filtered = prev.filter(item => 
            item.address.toLowerCase() !== address.toLowerCase()
          );
          return [...filtered, data]
            .sort((a, b) => b.overall_score - a.overall_score)
            .slice(0, 10);
        });
      }

    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setCurrentReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      title: "Token Analysis Engine",
      description: "AI-powered analysis of Solana tokens and their metrics.",
      header: <BentoImage src="/images/box-1.png" alt="Token Analysis Engine" />,
      className: "md:col-span-2",
      icon: <IconGraph className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Execute with natural language (coming soon)",
      description: "Wexley facilitates blockchain operations with a natural language interface.",
      header: <BentoImage src="/images/box-2.png" alt="Risk Assessment" />,
      className: "md:col-span-1",
      icon: <IconBrain className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Market Intelligence",
      description: "Deep insights into market trends, social sentiment & token performance.",
      header: <BentoImage src="/images/box-3.png" alt="Market Intelligence" />,
      className: "md:col-span-1",
      icon: <IconChartCandle className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "AI Trading Assistant",
      description: "Wexley is your all in one on-chain assistant. From chart analysis to executing advanced trading strategies",
      header: <BentoImage src="/images/box-4.png" alt="AI Trading Assistant" />,
      className: "md:col-span-2",
      icon: <IconCoin className="h-4 w-4 text-neutral-500" />,
    },
  ];

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-6xl mx-auto relative">
        <div className="absolute top-0 right-0">
          <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <span className="text-sm font-medium text-blue-400">
              🚀 Execute trades with Wexley - coming soon
            </span>
          </div>
        </div>

        {!currentReport && (
          <div className="absolute top-0 left-0">
            <a 
              href="/docs" 
              className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              <span className="text-sm font-medium text-blue-400">
                📚
              </span>
            </a>
          </div>
        )}

        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full opacity-20" />
          
          <div className="relative inline-flex items-center gap-2">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
              AEGIS
            </h1>
            <span className="absolute -right-12 top-0 px-2 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/20">
              BETA
            </span>
          </div>
          
          <p className="text-xl text-gray-300 mb-4 font-light tracking-wide">
            AI Enabled Gateway for Intelligent Solana Operation
          </p>
        </div>
        
        <div className="relative z-10">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          {!currentReport && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-16"
            >
              <BentoGrid className="max-w-4xl mx-auto">
                {features.map((item, i) => (
                  <BentoGridItem
                    key={i}
                    title={item.title}
                    description={item.description}
                    header={item.header}
                    className={item.className}
                    icon={item.icon}
                  />
                ))}
              </BentoGrid>
            </motion.div>
          )}

          {currentReport && (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ReportCard report={currentReport} />
              </div>
              <div className="lg:col-span-1">
                <div className="mt-8">
                  <ChatBox report={currentReport} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}