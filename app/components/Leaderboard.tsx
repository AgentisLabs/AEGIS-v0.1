'use client';

import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { TokenAnalysis } from '../types';

interface LeaderboardProps {
  tokens: TokenAnalysis[];
}

export default function Leaderboard({ tokens = [] }: LeaderboardProps) {
  const sortedTokens = [...tokens].sort((a, b) => b.overall_score - a.overall_score);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  if (tokens.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Top Tokens</h2>
        <p className="text-gray-400">No tokens analyzed yet</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-emerald-500" />
        <h2 className="text-2xl font-bold text-white">Top Tokens</h2>
      </div>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800"
      >
        {sortedTokens.map((token, index) => (
          <motion.div
            key={token.address}
            variants={item}
            className="flex items-center justify-between p-4 border-b border-gray-800 last:border-b-0"
          >
            <div className="flex items-center gap-4">
              <span className={`w-8 h-8 flex items-center justify-center rounded-full 
                ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' :
                  index === 1 ? 'bg-gray-400/20 text-gray-400 border-gray-400/50' :
                  index === 2 ? 'bg-amber-600/20 text-amber-600 border-amber-600/50' :
                  'bg-gray-800/50 text-gray-300 border-gray-800'} 
                font-semibold border`}
              >
                {index + 1}
              </span>
              <div>
                <span className="text-gray-300 font-medium">
                  {token.symbol || 'Unknown'}
                </span>
                <p className="text-sm text-gray-500 truncate max-w-[200px]">
                  {token.address}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-500 font-bold">{token.overall_score.toFixed(1)}</span>
              <span className="text-gray-500">/100</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}