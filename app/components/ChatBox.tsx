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
import WalletConnect from './WalletConnect';
import { useWallet } from '@solana/wallet-adapter-react';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { JupiterSwapTool } from '../lib/tools/jupiter-swap';
import { VersionedTransaction } from '@solana/web3.js';

interface ChatBoxProps {
  report: TokenAnalysis;
}

type AIModel = 'gpt-4' | 'claude-3' | 'xai';

type Message = {
  text: string;
  isUser: boolean;
  image?: string;
  isStreaming?: boolean;
};

type TradeType = 'buy' | 'sell' | 'limit' | 'stop';
type TradeModalState = {
  isOpen: boolean;
  type: TradeType | null;
};

export default function ChatBox({ report }: ChatBoxProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4');
  const [executionEnabled, setExecutionEnabled] = useState(false);
  const [chartImage, setChartImage] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showTradingPanel, setShowTradingPanel] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const { connected } = useWallet();
  const [tradeModal, setTradeModal] = useState<TradeModalState>({ isOpen: false, type: null });
  const [buyAmount, setBuyAmount] = useState<string>('');
  const [sellPercentage, setSellPercentage] = useState<number>(50);
  const [isExecuting, setIsExecuting] = useState(false);
  const wallet = useWallet();
  const [userTokenBalance, setUserTokenBalance] = useState<number>(0);
  const [slippage, setSlippage] = useState<string>('2');
  const slippageOptions = ['0.5', '1', '2', '5'];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isLoading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.isUser) {
        const loadingDots = setInterval(() => {
          setStreamingText(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(loadingDots);
      }
    }
  }, [isLoading, messages]);

  const exampleQueries = [
    "Analyze this chart",
    "Buy 0.5 SOL worth",
    "Sell 50% of holdings",
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

    // Parse trade commands
    const buyMatch = message.match(/buy\s+([\d.]+)\s*sol/i);
    const sellMatch = message.match(/sell\s+([\d.]+)%/i);

    if ((buyMatch || sellMatch) && !connected) {
      setMessages(prev => [...prev, {
        text: "Please connect your wallet first to execute trades.",
        isUser: false
      }]);
      setShowModal(true);
      return;
    }

    if (buyMatch && connected) {
      const amount = buyMatch[1];
      setMessages(prev => [...prev, { text: message, isUser: true }]);
      await executeTrade('buy', amount);
      return;
    }

    if (sellMatch && connected) {
      const percentage = parseFloat(sellMatch[1]);
      setMessages(prev => [...prev, { text: message, isUser: true }]);
      await executeTrade('sell', percentage);
      return;
    }

    // Continue with normal chat processing if no trade command detected
    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { 
        text: message, 
        isUser: true,
        image: chartImage || undefined 
      }]);
      
      setMessages(prev => [...prev, { 
        text: '', 
        isUser: false,
        isStreaming: true 
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
      
      setMessages(prev => prev.map((msg, index) => {
        if (index === prev.length - 1) {
          return { text: data.response, isUser: false, isStreaming: false };
        }
        return msg;
      }));
      setChartImage(null);
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

  const handleTrade = async (type: 'buy' | 'sell' | 'limit' | 'stop') => {
    if (!connected) {
      setShowModal(true);
      return;
    }

    // Here we'll implement the actual trading logic using our JupiterSwapTool
    console.log(`Executing ${type} trade for token:`, report.address);
    // TODO: Implement trade execution
  };

  const executeTrade = async (type: TradeType, amount: string | number) => {
    try {
      setIsExecuting(true);
      setTradeModal({ isOpen: false, type: null });
      
      // Calculate actual token amount for selling
      const sellAmount = type === 'sell' 
        ? Math.floor((userTokenBalance * (amount as number)) / 100)
        : amount;
      
      const queryParams = new URLSearchParams({
        token_in_address: type === 'buy' ? 'So11111111111111111111111111111111111111112' : report.address,
        token_out_address: type === 'buy' ? report.address : 'So11111111111111111111111111111111111111112',
        in_amount: type === 'buy' ? 
          (parseFloat(amount as string) * 1e9).toString() : // Convert SOL to lamports
          sellAmount.toString(), // Use calculated token amount for selling
        from_address: wallet.publicKey?.toString() || '',
        slippage: slippage
      });

      console.log('Requesting quote with params:', Object.fromEntries(queryParams.entries()));

      // Use our API route instead of calling gmgn.ai directly
      const quoteResponse = await fetch(`/api/trade?${queryParams.toString()}`);
      console.log('Quote response status:', quoteResponse.status);
      
      const quote = await quoteResponse.json();
      console.log('Full quote response:', JSON.stringify(quote, null, 2));

      if (!quote.data) {
        throw new Error(quote.msg || 'Failed to get quote');
      }

      if (!quote.data.raw_tx?.swapTransaction) {
        console.error('Unexpected quote response format:', quote);
        throw new Error('Invalid quote response format');
      }

      // Request wallet signature
      const swapTransactionBuf = Buffer.from(quote.data.raw_tx.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      
      console.log('Requesting wallet signature...');
      const signedTx = await wallet.signTransaction(transaction);
      const serializedTx = Buffer.from(signedTx.serialize()).toString('base64');

      console.log('Submitting signed transaction...');
      // Submit signed transaction through our API route
      const submitResponse = await fetch('/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit',
          signed_tx: serializedTx
        })
      });

      const submitResult = await submitResponse.json();
      console.log('Submit response:', submitResult);
      
      if (!submitResult.data) {
        throw new Error(submitResult.msg || 'Failed to submit transaction');
      }

      // Poll for transaction status through our API route
      console.log('Polling for transaction status...');
      
      // If we got here, the transaction was submitted successfully
      // Let's show a success message right away
      setMessages(prev => [...prev, {
        text: `✅ Trade submitted successfully!\nTransaction: ${submitResult.data.hash}\n\nAmount: ${
          type === 'buy' 
            ? `${amount} SOL → ${quote.data.quote.outAmount} ${report.symbol}`
            : `${amount}% ${report.symbol} → ${quote.data.quote.outAmount} SOL`
        }\n\nView on Solana Explorer: https://solscan.io/tx/${submitResult.data.hash}`,
        isUser: false
      }]);

      // Optional: Poll for final confirmation
      try {
        for (let i = 0; i < 3; i++) { // Reduced polling attempts
          const statusResponse = await fetch('/api/trade', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'status',
              hash: submitResult.data.hash,
              last_valid_height: quote.data.raw_tx.lastValidBlockHeight
            })
          });
          
          const status = await statusResponse.json();
          console.log('Status response:', status);
          
          if (status.code === 0 && status.data?.success === true) {
            console.log('Transaction confirmed on chain');
            break;
          }
          
          // Wait 2 seconds between checks
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (statusError) {
        console.log('Status check error (non-critical):', statusError);
        // Don't throw the error since the transaction might still be successful
      }

      return; // Exit after showing success message

    } catch (error) {
      console.error('Trade error:', error);
      setMessages(prev => [...prev, {
        text: `❌ Trade failed: ${error.message}`,
        isUser: false
      }]);
    } finally {
      setIsExecuting(false);
      setTradeModal({ isOpen: false, type: null }); // Keep this as a backup
    }
  };

  const fetchUserBalance = async () => {
    if (!wallet.publicKey || !report.address) return;
    
    try {
      const response = await fetch(`/api/balance?address=${wallet.publicKey.toString()}&token=${report.address}`);
      const data = await response.json();
      if (data.success) {
        setUserTokenBalance(data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch token balance:', error);
    }
  };

  useEffect(() => {
    if (wallet.publicKey && report.address) {
      fetchUserBalance();
    }
  }, [wallet.publicKey, report.address]);

  useEffect(() => {
    if (executionEnabled) {
      setShowTradingPanel(true);
    }
  }, [executionEnabled]);

  return (
    <>
      <div className="fixed top-4 left-4">
        <WalletConnect />
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
                onClick={() => {
                  if (connected) {
                    setExecutionEnabled(!executionEnabled);
                  } else {
                    setShowModal(true);
                  }
                }}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                  executionEnabled ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                    executionEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
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
                {msg.isUser ? msg.text : (
                  <>
                    {msg.isStreaming ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75" />
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150" />
                      </div>
                    ) : (
                      formatMessage(msg.text)
                    )}
                  </>
                )}
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

        {showTradingPanel && executionEnabled && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg">
                <span className="text-sm text-gray-400">Slippage:</span>
                <div className="flex gap-2">
                  {slippageOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSlippage(option)}
                      className={`px-2 py-1 text-xs rounded-md transition-colors duration-200 ${
                        slippage === option
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {option}%
                    </button>
                  ))}
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    className="w-12 px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded-md text-white text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Custom"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => connected ? setTradeModal({ isOpen: true, type: 'buy' }) : setShowModal(true)}
                  disabled={!connected || isExecuting}
                  className={`px-4 py-2 bg-green-500/20 text-green-400 rounded-lg 
                    transition-colors duration-200
                    ${connected ? 'hover:bg-green-500/30 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                >
                  {isExecuting ? 'Executing...' : 'Buy'}
                </button>
                <button 
                  onClick={() => connected ? setTradeModal({ isOpen: true, type: 'sell' }) : setShowModal(true)}
                  disabled={!connected || isExecuting}
                  className={`px-4 py-2 bg-red-500/20 text-red-400 rounded-lg 
                    transition-colors duration-200
                    ${connected ? 'hover:bg-red-500/30 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                >
                  {isExecuting ? 'Executing...' : 'Sell'}
                </button>
              </div>
              <div className="text-xs text-gray-500">
                {!connected ? 'Connect wallet to enable trading' : 'Trading enabled'}
              </div>
            </div>
          </motion.div>
        )}

        {tradeModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div 
              className="bg-gray-900 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3 className="text-white text-lg font-medium mb-4">
                {tradeModal.type === 'buy' ? 'Buy Token' : 'Sell Token'}
              </h3>
              
              {tradeModal.type === 'buy' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Select Amount (SOL)</label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[0.05, 0.1, 0.25, 0.5, 1.0, 2.0].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setBuyAmount(amount.toString())}
                          className={`py-2 px-3 rounded-lg transition-colors duration-200 ${
                            buyAmount === amount.toString()
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {amount} ◎
                        </button>
                      ))}
                    </div>
                    <div className="mt-4">
                      <label className="text-sm text-gray-400 mb-2 block">Custom Amount</label>
                      <Input
                        type="number"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        placeholder="Enter SOL amount"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Select Amount to Sell</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 75, 100].map((percent) => (
                        <button
                          key={percent}
                          onClick={() => setSellPercentage(percent)}
                          className={`py-2 px-3 rounded-lg transition-colors duration-200 ${
                            sellPercentage === percent
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {percent}%
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-400">
                      Balance: {(userTokenBalance / 1e6).toFixed(2)} {report.symbol}
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      Selling: {((userTokenBalance * sellPercentage) / 1e8).toFixed(2)} {report.symbol}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setTradeModal({ isOpen: false, type: null })}
                  className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeTrade(
                    tradeModal.type!, 
                    tradeModal.type === 'buy' ? buyAmount : sellPercentage
                  )}
                  disabled={isExecuting}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {isExecuting ? 'Executing...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </>
  );
} 