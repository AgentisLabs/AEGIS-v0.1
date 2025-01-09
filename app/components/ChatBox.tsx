'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Image as ImageIcon, Maximize2, Minimize2, BarChart2 } from 'lucide-react';
import { TokenAnalysis } from '../types';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { WEXLEY_PERSONALITY } from '../lib/constants';
import Image from 'next/image';

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
  const [isMaximized, setIsMaximized] = useState(false);
  const [showTradingPanel, setShowTradingPanel] = useState(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const exampleQueries = [
    "Analyze this chart",
    "Buy 1 SOL worth",
    "Any recent publications or notable tweets?",
    "What is your 1 week forecast for this token?",
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
          chartImage: chartImage,
          messageHistory: messages,
          personality: WEXLEY_PERSONALITY
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

  const formatMessage = (text: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-xl font-bold text-white mb-4">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-semibold text-white mb-3">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-md font-medium text-white mb-2">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-gray-300 mb-4">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300">{children}</ul>
        ),
        li: ({ children }) => (
          <li className="ml-4">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-blue-400">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-cyan-400">{children}</em>
        ),
        code: ({ children }) => (
          <code className="bg-gray-800 rounded px-1 py-0.5 text-pink-400">{children}</code>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );

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
        className={cn(
          "bg-gray-900/95 rounded-lg p-4 shadow-xl transition-all duration-300",
          isMaximized 
            ? "fixed inset-4 z-50 m-auto max-h-[90vh] max-w-6xl" 
            : "w-full max-w-2xl mx-auto"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-medium">Wexley v1.1</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Execution</span>
              <button
                onClick={() => setShowModal(true)}
                className="w-12 h-6 rounded-full transition-colors duration-200 ease-in-out bg-gray-600"
              >
                <div className="w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ease-in-out translate-x-1" />
              </button>
            </div>
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors duration-200"
            >
              {isMaximized ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div 
          ref={chatContainerRef}
          className={cn(
            "overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent",
            isMaximized ? "h-[calc(85vh-180px)]" : "h-[400px]"
          )}
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
                className={cn(
                  "p-4 rounded-lg",
                  msg.isUser 
                    ? "bg-blue-500/20 text-white ml-auto" 
                    : "bg-gray-800/50 text-gray-200",
                  "max-w-[85%]",
                  msg.isUser ? "ml-auto" : "mr-auto"
                )}
              >
                {msg.image && (
                  <div className="relative w-full h-[200px]">
                    <Image 
                      src={msg.image} 
                      alt="Chart" 
                      className="rounded-lg mb-2"
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                )}
                {msg.isUser ? msg.text : formatMessage(msg.text)}
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
            className="w-full p-4 bg-gray-800/50 rounded-lg pr-32 
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
              type="button"
              onClick={() => setShowTradingPanel(!showTradingPanel)}
              className={`p-2 transition-colors duration-200 ${
                showTradingPanel ? 'text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-5 h-5" />
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
            <div className="relative w-full h-[200px]">
              <Image 
                src={chartImage} 
                alt="Selected chart" 
                className="rounded-lg mb-2"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
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

        {isMaximized && (
          <div 
            className="fixed inset-0 bg-black/50 -z-10" 
            onClick={() => setIsMaximized(false)}
          />
        )}

        {showTradingPanel && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg 
                             hover:bg-green-500/30 transition-colors duration-200">
                Buy
              </button>
              <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg 
                             hover:bg-red-500/30 transition-colors duration-200">
                Sell
              </button>
              <button className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg 
                             hover:bg-blue-500/30 transition-colors duration-200">
                Limit Order
              </button>
              <button className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg 
                             hover:bg-purple-500/30 transition-colors duration-200">
                Stop Loss
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Connect wallet to enable trading
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
} 