'use client';

import { useState } from 'react';

interface FirmReport {
  name: string;
  overall_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  sources: string[];
  twitter_sentiment?: {
    sentiment_score: number;
    summary: string;
    key_points: string[];
  };
}

interface LeaderboardEntry {
  name: string;
  score: number;
}

export default function FirmSearch() {
  const [firmName, setFirmName] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentReport, setCurrentReport] = useState<FirmReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze-firm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firmName }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze firm');
      }

      const data = await response.json();
      setCurrentReport(data);

      // Update leaderboard
      setLeaderboard(prev => {
        const newLeaderboard = [...prev, { name: data.name, score: data.score }];
        return newLeaderboard.sort((a, b) => b.score - a.score);
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
      setFirmName('');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl py-24 mx-auto stretch">
      <h1 className="text-3xl font-bold mb-8">Prop Firm Report Card Generator</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <input
          className="w-full p-2 border border-gray-300 rounded shadow-xl"
          value={firmName}
          placeholder="Enter firm name..."
          onChange={(e) => setFirmName(e.target.value)}
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Firm'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {currentReport && (
        <div className="mb-8 p-4 border rounded">
          <h2 className="text-2xl font-bold">{currentReport.name}</h2>
          <div className="text-xl mb-2">Score: {currentReport.overall_score}/100</div>
          <div className="mb-4">{currentReport.summary}</div>
          
          {currentReport.twitter_sentiment && (
            <div className="mb-4">
              <h3 className="font-bold">Twitter Sentiment:</h3>
              <p>{currentReport.twitter_sentiment.summary}</p>
            </div>
          )}
          
          <h3 className="font-bold">Sources:</h3>
          <ul className="list-disc pl-4">
            {currentReport.sources.map((source, i) => (
              <li key={i}>{source}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
        <div className="border rounded">
          {leaderboard.map((entry, i) => (
            <div key={i} className="p-2 border-b flex justify-between">
              <span>{entry.name}</span>
              <span>{entry.score}/100</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
