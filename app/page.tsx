'use client';

import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ReportCard from './components/ReportCard';
import Leaderboard from './components/Leaderboard';
import { TokenAnalysis } from './types';

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
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Solana Token Analyzer
        </h1>
        
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentReport && <ReportCard report={currentReport} />}
          </div>
          
          <div className="lg:col-span-1">
            <Leaderboard tokens={leaderboard} />
          </div>
        </div>
      </div>
    </main>
  );
}