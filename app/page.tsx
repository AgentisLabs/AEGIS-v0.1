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
  const [searchAttempt, setSearchAttempt] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firmName) return;

    setIsLoading(true);
    setError(null);

    const fetchAnalysis = async (retryAttempt = 0): Promise<any> => {
      try {
        const response = await fetch('/api/analyze-firm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firmName })
        });

        // Handle timeout
        if (response.status === 504) {
          if (retryAttempt < 5) { // Increased to 5 retries
            console.log(`Timeout occurred, retrying (attempt ${retryAttempt + 1})...`);
            setSearchAttempt(retryAttempt + 1);
            await new Promise(resolve => setTimeout(resolve, 10000)); // Increased to 10 seconds
            return fetchAnalysis(retryAttempt + 1);
          } else {
            throw new Error('Analysis is still in progress. Please refresh the page to check results.');
          }
        }

        // Handle other non-200 responses
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage;
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || 'Failed to analyze firm';
          } catch {
            errorMessage = errorText || `Server error: ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        // Parse successful response
        const data = await response.json();
        return data;
      } catch (error) {
        throw error;
      }
    };

    try {
      const data = await fetchAnalysis();
      
      setCurrentReport(data);
      
      // Update leaderboard if we have a score
      if (data && typeof data.overall_score === 'number') {
        setLeaderboard(prev => {
          const filtered = prev.filter(item => 
            item.name.toLowerCase() !== firmName.toLowerCase()
          );
          const newEntry = {
            name: firmName,
            score: data.overall_score
          };
          return [...filtered, newEntry]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        });
      }

    } catch (err) {
      console.error('Search error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setSearchAttempt(0);
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

      {isLoading && (
        <div className="text-center mt-4">
          <div className="text-cyan-500 font-semibold mb-2">
            {searchAttempt > 0 
              ? `Still analyzing... (attempt ${searchAttempt}/5)` 
              : "Analyzing firm..."}
          </div>
          <div className="text-gray-400 text-sm">
            {searchAttempt === 0 
              ? "First analysis of a new firm typically takes 30-60 seconds" 
              : "This is taking longer than usual, but we're still working on it..."}
          </div>
        </div>
      )}
    </div>
  );
}
