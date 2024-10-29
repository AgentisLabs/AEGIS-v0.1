'use client';

import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { ReportCard } from './components/ReportCard';
import { Leaderboard } from './components/Leaderboard';

export default function FirmSearch() {
  const [firmName, setFirmName] = useState('');
  const [currentReport, setCurrentReport] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Array<{ name: string; score: number }>>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firmName) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-firm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firmName })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setCurrentReport(data);
      
      // Add to leaderboard if we have a valid score
      if (data && typeof data.overall_score === 'number') {
        setLeaderboard(prev => {
          // Remove existing entry if present
          const filtered = prev.filter(item => item.name.toLowerCase() !== firmName.toLowerCase());
          // Add new entry
          const newEntry = {
            name: firmName,
            score: data.overall_score
          };
          // Add and sort
          return [...filtered, newEntry]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Keep top 10
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirmClick = (name: string) => {
    setFirmName(name);
    handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl py-24 mx-auto stretch">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-white">
          Prop-View 🔍
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <SearchBar 
          value={firmName} 
          onChange={setFirmName} 
          isLoading={isLoading} 
        />
        <div className="flex justify-center">
          <button 
            type="submit"
            disabled={isLoading}
            className="mt-4 px-8 py-3 bg-cyan-500/20 hover:bg-cyan-500/30
              text-cyan-500 rounded-xl font-medium
              disabled:bg-gray-800 disabled:text-gray-600
              transition-all duration-300 ease-in-out
              min-w-[160px]"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Firm'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl backdrop-blur-lg">
          {error}
        </div>
      )}

      {currentReport && <ReportCard report={currentReport} />}

      {leaderboard && leaderboard.length > 0 && (
        <div className="mt-12">
          <Leaderboard 
            leaderboard={leaderboard} 
            onFirmClick={handleFirmClick}
          />
        </div>
      )}
    </div>
  );
}
