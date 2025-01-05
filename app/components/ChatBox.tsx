'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Image as ImageIcon } from 'lucide-react';
import { TokenAnalysis } from '../types';

interface ChatBoxProps {
  report: TokenAnalysis;
}

type AIModel = 'gpt-4' | 'claude-3' | 'xai';

export default function ChatBox({ report }: ChatBoxProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; image?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4');
  const [executionEnabled, setExecutionEnabled] = useState(false);
  const [chartImage, setChartImage] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const exampleQueries = [
    "Buy 3 SOL worth",
    "Exit this position once we reach $5M mcap",
    "What are your bull and bear cases for this token?",
    "Analyze this chart",
    "Is this a good entry point?"
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setChartImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { 
        text: message, 
        isUser: true,
        image: chartImage || undefined 
      }]);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          tokenReport: report,
          chartImage: chartImage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { text: data.response, isUser: false }]);
      setChartImage(null); // Clear the image after sending
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I couldn't process that request. Please try again.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  return (
    <>
      <div className="fixed top-4 left-4">
        <button
          disabled
          className="bg-gray-800 text-gray-400 px-4 py-2 rounded-lg opacity-50 cursor-not-allowed"
        >
          Connect Wallet
        </button>
      </div>
      
      <motion.div 
        className="bg-gray-900/95 rounded-lg p-4 w-full max-w-2xl mx-auto shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-medium">Wexley v1.1</span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Execution</span>
            <button
              onClick={() => setShowModal(true)}
              className="w-12 h-6 rounded-full transition-colors duration-200 ease-in-out bg-gray-600"
            >
              <div className="w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ease-in-out translate-x-1" />
            </button>
          </div>
        </div>

        <div 
          ref={chatContainerRef}
          className="h-[400px] overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
        >
          {messages.length === 0 && message.trim() === '' ? (
            <div className="space-y-2">
              {exampleQueries.map((query, index) => (
                <div
                  key={index}
                  onClick={() => setMessage(query)}
                  className="p-3 bg-gray-800/50 rounded-lg text-gray-400 hover:text-white 
                           hover:bg-gray-800 cursor-pointer transition-all duration-200"
                >
                  {query}
                </div>
              ))}
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  msg.isUser 
                    ? 'bg-blue-500/20 text-white ml-auto' 
                    : 'bg-gray-800/50 text-gray-200'
                } max-w-[80%] ${msg.isUser ? 'ml-auto' : 'mr-auto'}`}
              >
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="Chart" 
                    className="max-w-full h-auto rounded-lg mb-2"
                  />
                )}
                {msg.text}
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about this token..."
            className="w-full p-4 bg-gray-800/50 rounded-lg pr-24 
                     text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                     focus:ring-blue-500/40 focus:border-transparent"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 text-gray-400 hover:text-white transition-colors duration-200 ${
                chartImage ? 'text-blue-400' : ''
              }`}
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
        
        {chartImage && (
          <div className="mt-2 relative">
            <img 
              src={chartImage} 
              alt="Selected chart" 
              className="max-h-32 rounded-lg object-contain"
            />
            <button
              onClick={() => setChartImage(null)}
              className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full 
                       hover:bg-red-600 transition-colors duration-200"
            >
              ×
            </button>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div 
              className="bg-gray-900 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3 className="text-white text-lg font-medium mb-2">Wallet Not Connected</h3>
              <p className="text-gray-400 mb-4">Please connect a wallet to execute trades.</p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </>
  );
} 