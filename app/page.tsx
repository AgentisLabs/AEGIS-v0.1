'use client';

import { useState } from 'react';
import Image from 'next/image';
import SearchBar from './components/SearchBar';
import ReportCard from './components/ReportCard';
import { TokenAnalysis } from './types';
import ChatBox from './components/ChatBox';
import { motion } from 'framer-motion';
import WalletConnect from './components/WalletConnect';
import { cn } from '@/lib/utils';
import TrendingTokens from './components/TrendingTokens';

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
  const [showProModal, setShowProModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [searchMode, setSearchMode] = useState<'lite' | 'pro'>('lite');

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

      if (!marketDataResponse.ok) {
        throw new Error('Failed to fetch market data');
      }

      const marketDataResult = await marketDataResponse.json();
      
      // Validate market data response
      if (marketDataResult && marketDataResult.data) {
        setCurrentReport(prev => ({
          ...prev,
          market_data: marketDataResult.data,
          summary: "Analyzing token...",
          loading: true
        }));
      }

      // Second fetch: Full analysis
      const analysisResponse = await fetch('/api/analyze-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.text();
        try {
          const parsedError = JSON.parse(errorData);
          throw new Error(parsedError.error || 'Failed to analyze token');
        } catch (parseError) {
          throw new Error(`Failed to analyze token: ${errorData}`);
        }
      }

      const analysisText = await analysisResponse.text();
      let analysisData;
      try {
        analysisData = JSON.parse(analysisText);
      } catch (parseError) {
        console.error('Raw response:', analysisText);
        throw new Error('Invalid JSON in analysis response');
      }

      // Preserve the market data we already have
      setCurrentReport(prev => ({ 
        ...analysisData.data, 
        market_data: analysisData.data.market_data || prev?.market_data,
        loading: false 
      }));

    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setCurrentReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      // Generate shareable URL
      const shareableUrl = `${window.location.origin}/report/${currentReport?.address}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareableUrl);
      
      // Show success toast or alert
      alert('Report link copied to clipboard!');
      
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to share report');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* WalletConnect in top left when no token analysis */}
        {!currentReport && (
          <div className="absolute top-0 left-4 md:left-8 z-50">
            <WalletConnect />
          </div>
        )}

        {/* Documentation and Agentis Labs buttons in top right */}
        <div className="absolute top-0 right-0 z-10 hidden md:flex items-center gap-4">
          <div className="flex items-center gap-4">
            <a 
              href="/docs" 
              className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 
                rounded-lg hover:bg-blue-500/20 transition-colors flex items-center gap-2"
            >
              <span className="text-sm font-medium text-blue-400">
                📚 Documentation
              </span>
            </a>
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
        </div>

        <div className="text-center mb-8 md:mb-16 relative pt-16 md:pt-20">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full opacity-20" />
          
          <div className="relative inline-flex items-center gap-2">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
              AEGIS
            </h1>
            <span className="absolute -right-8 md:-right-12 top-0 px-2 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/20">
              BETA
            </span>
          </div>
          
          <p className="text-lg md:text-xl text-gray-300 mb-4 font-light tracking-wide mt-4 px-4 md:px-0">
            AI Enabled Gateway for Intelligent Solana Operation
          </p>

          <div className="flex justify-center mt-4 md:hidden">
            <a 
              href="https://agentislabs.xyz" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors flex items-center gap-2"
            >
              <span className="text-xs font-medium text-blue-400">
                Powered by Agentis Labs
              </span>
              <Image
                src="/agentislogo.jpg"
                alt="Agentis Labs Logo"
                width={16}
                height={16}
                className="rounded-full"
              />
            </a>
          </div>
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
                    href="https://twitter.com/agentislab"
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
              <TrendingTokens onAnalyze={handleSearch} />
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