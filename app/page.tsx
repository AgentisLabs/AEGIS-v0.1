'use client';

import { useState } from 'react';
import Image from 'next/image';
import SearchBar from './components/SearchBar';
import ReportCard from './components/ReportCard';
import Leaderboard from './components/Leaderboard';
import { TokenAnalysis } from './types';
import ChatBox from './components/ChatBox';

export default function TokenAnalyzer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<TokenAnalysis | null>(null);
  const [leaderboard, setLeaderboard] = useState<TokenAnalysis[]>([]);

  const handleSearch = async (address: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze token');
      }

      const { data } = await response.json();
      setCurrentReport(data);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-6xl mx-auto relative">
        <div className="absolute top-0 right-0 flex items-center gap-2 text-gray-400">
          <Image 
            src="/agentislogo.jpg"
            alt="Agentis Labs Logo"
            width={24}
            height={24}
            className="rounded-full"
          />
          <a 
            href="https://www.agentislabs.ai" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm font-medium hover:text-gray-300 transition-colors duration-200 cursor-pointer"
          >
            Agentis Labs
          </a>
        </div>

        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full opacity-20" />
          
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
            AEGIS
          </h1>
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

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {currentReport && <ReportCard report={currentReport} />}
            </div>
            
            <div className="lg:col-span-1">
              {currentReport && (
                <div className="mt-8">
                  <ChatBox report={currentReport} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}