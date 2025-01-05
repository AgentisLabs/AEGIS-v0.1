import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (address: string) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onSearch(address.trim());
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full relative z-20"
    >
      <div className="relative flex items-center max-w-2xl mx-auto">
        <div className="relative flex-1">
          <div className="absolute inset-0 bg-blue-500/10 rounded-lg blur-md -z-10" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter a Solana token address for analysis"
            className="w-full px-6 py-4 bg-gray-900/50 border border-gray-700/50 rounded-lg pl-12 pr-4 
                     text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                     focus:ring-blue-500/40 focus:border-transparent transition-all duration-200
                     relative z-10"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !address.trim()}
          className={`ml-4 px-6 py-4 rounded-lg font-medium transition-all duration-200
                    relative z-10
                    ${isLoading 
                      ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 hover:scale-105'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-lg`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Analyze'
          )}
        </button>
      </div>
    </motion.form>
  );
}