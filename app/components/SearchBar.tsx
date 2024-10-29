import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ value, onChange, isLoading = false }: SearchBarProps) {
  return (
    <div className="w-full max-w-2xl mx-auto relative flex items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search for a prop firm..."
        className="w-full px-6 py-4 text-lg rounded-xl
          bg-gray-900/50 backdrop-blur-lg
          border border-gray-800 hover:border-cyan-500/50
          text-white placeholder-gray-400
          focus:outline-none focus:border-cyan-500
          transition-all duration-300 ease-in-out
          shadow-lg shadow-black/10"
      />
      <div
        className="absolute right-4 p-2 rounded-lg
          text-gray-400
          transition-all duration-300 ease-in-out"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-gray-600 border-t-cyan-500 rounded-full animate-spin" />
        ) : (
          <Search className="w-5 h-5" />
        )}
      </div>
    </div>
  );
}
