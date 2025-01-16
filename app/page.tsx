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
import WalletButton from './components/WalletButton';
import { cn } from '@/lib/utils';

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
  const [searchMode, setSearchMode] = useState<'lite' | 'pro'>('lite');
  const [showProModal, setShowProModal] = useState(false);

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
      title: "Natural Language Execution",
      description: "Execute trades with natural language by talking to Wexley.",
      header: <BentoImage src="/images/box-2.png" alt="Natural Language Trading" />,
      className: "md:col-span-1",
      icon: <IconBrain className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Market Intelligence",
      description: "Real-time market data and sentiment analysis for informed decision making.",
      header: <BentoImage src="/images/box-3.png" alt="Market Intelligence" />,
      className: "md:col-span-1",
      icon: <IconChartCandle className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "Customizeable Analysis Flows (coming soon)",
      description: "Create and deploy your own analysis workflow with customizable data sources and personalized trading strategies.",
      header: <BentoImage src="/images/box-4.png" alt="Custom Trading Agents" />,
      className: "md:col-span-2",
      icon: <IconCoin className="h-4 w-4 text-neutral-500" />,
    },
  ];

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-6xl mx-auto relative">
        <div className="absolute top-0 right-0 z-10">
          <a 
            href="https://agentislabs.ai" 
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center gap-2"
          >
            <span className="text-sm font-medium text-blue-400">
              Powered by Agentis Labs
            </span>
            <Image
              src="/agentislogo.jpg"
              alt="Agentis Labs Logo"
              width={20}
              height={20}
              className="rounded-full"
            />
          </a>
        </div>

        <div className="absolute top-0 left-48">
          <a 
            href="/docs" 
            className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            <span className="text-sm font-medium text-blue-400">
              📚
            </span>
          </a>
        </div>

        <div className="text-center mb-16 relative pt-12 md:pt-0">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full opacity-20" />
          
          <div className="relative inline-flex items-center gap-2">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
              AEGIS
            </h1>
            <span className="absolute -right-12 top-0 px-2 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/20">
              BETA
            </span>
          </div>
          
          <p className="text-xl text-gray-300 mb-4 font-light tracking-wide mt-4">
            AI Enabled Gateway for Intelligent Solana Operation
          </p>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  Advanced Analysis
                </span>
                <button
                  onClick={() => {
                    if (searchMode === 'lite') {
                      setShowProModal(true);
                    }
                  }}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors duration-200",
                    searchMode === 'pro' 
                      ? "bg-blue-500" 
                      : "bg-gray-600"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200",
                      searchMode === 'pro' && "translate-x-6"
                    )}
                  />
                </button>
              </div>
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </div>

          {/* Pro Mode Modal */}
          {showProModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <motion.div 
                className="bg-gray-900 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <h3 className="text-white text-lg font-medium mb-2">Pro Analysis Access</h3>
                <p className="text-gray-400 mb-4">
                  Advanced analytics are currently in closed beta. Join the waitlist by sending us a DM on Twitter to get early access to advanced metrics and deeper analysis!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowProModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                  <a 
                    href="https://twitter.com/aegisolana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center"
                  >
                    Join Waitlist
                  </a>
                </div>
              </motion.div>
            </div>
          )}

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