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
      <div className="relative flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter a Solana token address for analysis"
            className="w-full px-6 py-4 bg-gray-900/50 backdrop-blur-sm 
                     border border-gray-800/50 hover:border-blue-500/20
                     rounded-xl pl-12 pr-4 
                     text-gray-200 placeholder-gray-400 
                     focus:outline-none focus:ring-2 
                     focus:ring-blue-500/20 focus:border-transparent 
                     transition-all duration-300"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !address.trim()}
          className={`px-6 py-4 rounded-xl font-medium transition-all duration-300
                    w-full sm:w-auto
                    ${isLoading 
                      ? 'bg-gray-800/50 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                    border border-gray-800/50 hover:border-blue-500/20
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            'Analyze'
          )}
        </button>
      </div>
    </motion.form>
  );
}