import React from 'react';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  name: string;
  score: number;
}

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  onFirmClick?: (firmName: string) => void;
}

export function Leaderboard({ leaderboard = [], onFirmClick }: LeaderboardProps) {
  const sortedFirms = leaderboard ? [...leaderboard].sort((a, b) => b.score - a.score) : [];

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

  if (!leaderboard || leaderboard.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto mt-12"
    >
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-emerald-500" />
        <h2 className="text-2xl font-bold text-white">Top Prop Firms</h2>
      </div>
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800"
      >
        {sortedFirms.map((firm, index) => (
          <motion.div
            key={firm.name}
            variants={item}
            onClick={() => onFirmClick?.(firm.name)}
            className={`flex items-center justify-between p-4 border-b border-gray-800 
              last:border-b-0 hover:bg-gray-800/30 transition-colors duration-300
              ${onFirmClick ? 'cursor-pointer' : ''}`}
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
              <span className="text-gray-300 font-medium">{firm.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-500 font-bold">{firm.score.toFixed(1)}</span>
              <span className="text-gray-500">/100</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}