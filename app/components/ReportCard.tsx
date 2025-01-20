'use client';

import { useState, useEffect } from 'react';
import { Star, TrendingUp, Users, ExternalLink, Wallet, BarChart3, Activity, Link, ChartBar, Share2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { TokenAnalysis } from '../types';

interface ReportCardProps {
  report: TokenAnalysis;
}

// Update scoring logic functions with more precise tiers
const getMarketCapScore = (marketCap: number) => {
  if (marketCap >= 10000000000) return 95;  // $10B+
  if (marketCap >= 5000000000) return 92;   // $5B+
  if (marketCap >= 1000000000) return 90;   // $1B+
  if (marketCap >= 500000000) return 85;    // $500M+
  if (marketCap >= 250000000) return 82;    // $250M+
  if (marketCap >= 100000000) return 80;    // $100M+
  if (marketCap >= 50000000) return 75;     // $50M+
  if (marketCap >= 25000000) return 72;     // $25M+
  if (marketCap >= 10000000) return 70;     // $10M+
  if (marketCap >= 5000000) return 65;      // $5M+
  if (marketCap >= 2500000) return 62;      // $2.5M+
  if (marketCap >= 1000000) return 60;      // $1M+
  if (marketCap >= 750000) return 55;       // $750K+
  if (marketCap >= 500000) return 50;       // $500K+
  if (marketCap >= 250000) return 45;       // $250K+
  if (marketCap >= 100000) return 40;       // $100K+
  if (marketCap >= 50000) return 35;        // $50K+
  return 30;                                // Under $50K
};

const getVolumeScore = (volume24h: number, marketCap: number) => {
  const volumeRatio = volume24h / marketCap * 100;
  
  if (volumeRatio >= 50) return 95;       // Extremely high volume
  if (volumeRatio >= 35) return 92;       // Very high volume
  if (volumeRatio >= 25) return 90;       // Strong volume
  if (volumeRatio >= 20) return 85;       // High volume
  if (volumeRatio >= 15) return 82;       // Good volume
  if (volumeRatio >= 10) return 80;       // Healthy volume
  if (volumeRatio >= 7.5) return 75;      // Above average volume
  if (volumeRatio >= 5) return 70;        // Average volume
  if (volumeRatio >= 4) return 65;        // Moderate volume
  if (volumeRatio >= 3) return 62;        // Below average volume
  if (volumeRatio >= 2) return 60;        // Low volume
  if (volumeRatio >= 1.5) return 55;      // Very low volume
  if (volumeRatio >= 1) return 50;        // Minimal volume
  if (volumeRatio >= 0.75) return 45;     // Concerning volume
  if (volumeRatio >= 0.5) return 40;      // Poor volume
  if (volumeRatio >= 0.25) return 35;     // Very poor volume
  return 30;                              // Extremely poor volume
};

export default function ReportCard({ report }: ReportCardProps) {
  const [loadingStates, setLoadingStates] = useState({
    basicInfo: true,
    marketData: true,
    analysis: true,
    social: true
  });
  const [isSharing, setIsSharing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update loading states when report changes
  useEffect(() => {
    // If we have market data but the full report is still loading
    if (report.market_data && report.loading) {
      setLoadingStates(prev => ({
        ...prev,
        basicInfo: false,
        marketData: false,
        analysis: true,
        social: true
      }));
    } 
    // If the full report is done loading
    else if (!report.loading) {
      setLoadingStates({
        basicInfo: false,
        marketData: false,
        analysis: false,
        social: false
      });
    }
    // Initial loading state
    else {
      setLoadingStates({
        basicInfo: true,
        marketData: true,
        analysis: true,
        social: true
      });
    }
  }, [report, report.market_data, report.loading]);

  const LoadingSkeleton = () => (
    <div className="h-8 bg-gray-800 animate-pulse rounded-lg" />
  );

  // Update the metrics array with scores
  const metrics = [
    { 
      icon: Wallet,
      label: 'Market Cap', 
      value: report.market_data?.market_metrics?.marketCap ? 
             `$${new Intl.NumberFormat('en-US', {
               notation: 'compact',
               maximumFractionDigits: 1
             }).format(report.market_data.market_metrics.marketCap)}` : 
             '-',
      subValue: report.market_data?.market_metrics?.marketCap ? 
                `Score: ${getMarketCapScore(report.market_data.market_metrics.marketCap)}/100` : 
                null
    },
    { 
      icon: Activity, 
      label: 'Price Trend', 
      value: report.market_data?.market_metrics?.price_trend?.price_trend === 'up' ? '↑ Up' :
             report.market_data?.market_metrics?.price_trend?.price_trend === 'down' ? '↓ Down' : 
             'Neutral',
      subValue: report.market_data?.market_metrics?.price_trend?.price_change_24h ? 
                `${report.market_data.market_metrics.price_trend.price_change_24h.toFixed(2)}%` : 
                null
    },
    { 
      icon: BarChart3, 
      label: 'Liquidity', 
      value: report.market_data?.market_metrics?.liquidity_usd ? 
             `$${new Intl.NumberFormat('en-US', {
               notation: 'compact',
               maximumFractionDigits: 1
             }).format(report.market_data.market_metrics.liquidity_usd)}` : 
             '-',
      subValue: report.market_data?.market_metrics?.liquidity_score ? 
                `Score: ${Math.round(report.market_data.market_metrics.liquidity_score)}/100` : 
                null
    },
    { 
      icon: ChartBar, 
      label: '24h Volume', 
      value: report.market_data?.market_metrics?.volume_24h ? 
             `$${new Intl.NumberFormat('en-US', {
               notation: 'compact',
               maximumFractionDigits: 1
             }).format(report.market_data.market_metrics.volume_24h)}` : 
             '-',
      subValue: report.market_data?.market_metrics?.volume_24h && report.market_data?.market_metrics?.marketCap ? 
                `Score: ${getVolumeScore(
                  report.market_data.market_metrics.volume_24h,
                  report.market_data.market_metrics.marketCap
                )}/100` : 
                null
    }
  ];

  // Add debug log for the actual price trend value being used
  console.log('Price trend value being used:', {
    priceTrendPath: report.market_data?.market_metrics?.price_trend?.price_trend,
    fullPriceTrendObject: report.market_data?.market_metrics?.price_trend,
    marketMetrics: report.market_data?.market_metrics,
    marketData: report.market_data
  });

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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  {/* Add this debug log */}
  {console.log('Attempting to render social metrics:', {
    hasSocialMetrics: !!report.social_metrics,
    socialMetricsData: report.social_metrics
  })}

  {/* Add this debug log */}
  {console.log('Report data in ReportCard:', {
    hasSocialMetrics: !!report.social_metrics,
    socialMetricsData: report.social_metrics,
    fullReport: report
  })}

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const response = await fetch('/api/analysis/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });

      const result = await response.json();
      if (result.success) {
        // Optionally open the tweet in a new window
        window.open(result.tweetUrl, '_blank');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error sharing analysis:', error);
      // Add your error handling UI here
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 text-white border border-gray-800 relative"
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          {loadingStates.basicInfo ? (
            <div className="space-y-4">
              <LoadingSkeleton />
              <LoadingSkeleton />
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-2">
                {report.market_data?.market_metrics?.pair?.base_token?.symbol || 'Unknown Token'}
                <span className="text-gray-400 text-lg ml-2">
                  {report.market_data?.market_metrics?.pair?.quote_token?.symbol && 
                   `/ ${report.market_data.market_metrics.pair.quote_token.symbol}`}
                </span>
              </h2>
              <p className="text-sm font-mono text-gray-400 break-all">{report.address}</p>
              {report.market_data?.market_metrics?.pair?.base_token?.name && (
                <p className="text-sm text-gray-400 mt-1">
                  {report.market_data.market_metrics.pair.base_token.name}
                </p>
              )}
            </>
          )}
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: loadingStates.basicInfo ? 0 : 1 }}
          transition={{ delay: 0.3 }}
          className="text-right"
        >
          <div className={`text-4xl font-bold ${
            loadingStates.basicInfo ? 'text-gray-400' :
            report.overall_score >= 70 ? 'text-green-500' :
            report.overall_score >= 50 ? 'text-yellow-500' :
            'text-red-500'
          }`}>
            {loadingStates.basicInfo ? '-' : report.overall_score}
          </div>
          <div className="text-gray-400">Trust Score</div>
        </motion.div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            variants={item}
            className="bg-gray-800/50 rounded-lg p-4"
          >
            <div className="flex items-center mb-2">
              <metric.icon className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-gray-400 text-sm">{metric.label}</span>
            </div>
            {loadingStates.marketData ? (
              <div className="h-6 bg-gray-700 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.subValue && (
                  <div className="text-sm text-gray-400 mt-1">{metric.subValue}</div>
                )}
              </>
            )}
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show">
        <h3 className="text-xl font-semibold mb-4">Analysis Summary</h3>
        {loadingStates.analysis ? (
          <div className="space-y-2">
            <LoadingSkeleton />
            <LoadingSkeleton />
          </div>
        ) : (
          <div className="relative">
            <p className={`text-gray-300 ${!isExpanded && 'line-clamp-4'}`}>
              {report.summary}
            </p>
            {report.summary && report.summary.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium focus:outline-none"
              >
                {isExpanded ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
        )}
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Market Assessment</h3>
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
            <h4 className="text-lg font-semibold mb-3 text-blue-500">Market Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Price Trend</span>
                <span className={`font-semibold px-3 py-1 rounded-full ${
                  loadingStates.analysis ? 'bg-gray-500/20 text-gray-400' :
                  report.market_data?.market_metrics?.price_trend?.price_trend === 'up' ? 'bg-green-500/20 text-green-400' :
                  report.market_data?.market_metrics?.price_trend?.price_trend === 'down' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {loadingStates.analysis ? 'Unknown' :
                   report.market_data?.market_metrics?.price_trend?.price_trend === 'up' ? '↑ Up' :
                   report.market_data?.market_metrics?.price_trend?.price_trend === 'down' ? '↓ Down' :
                   'Neutral'
                  }
                  {report.market_data?.market_metrics?.price_trend?.price_change_24h && 
                    ` (${report.market_data.market_metrics.price_trend.price_change_24h.toFixed(2)}%)`
                  }
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Liquidity</span>
                <span className="font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                  ${report.market_data?.market_metrics?.liquidity_usd?.toLocaleString() || '0'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Trading Volume (24h)</span>
                <span className="font-semibold px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">
                  ${report.market_data?.market_metrics?.volume_24h?.toLocaleString() || '0'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Market Cap</span>
                <span className="font-semibold px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                  ${report.market_data?.market_metrics?.marketCap?.toLocaleString() || '0'}
                </span>
              </div>
            </div>

            {report.market_metrics?.liquidity_assessment && (
              <div className="mt-4 p-3 bg-gray-900/50 rounded-lg text-gray-300 text-sm">
                <p>{report.market_metrics.liquidity_assessment}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Social Metrics</h3>
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-gray-400 text-sm mb-1">Sentiment Score</div>
                <div className={`text-2xl font-bold ${
                  loadingStates.social ? 'text-gray-400' :
                  (report.social_metrics?.sentiment_score || 0) >= 70 ? 'text-green-400' :
                  (report.social_metrics?.sentiment_score || 0) >= 40 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {loadingStates.social ? '-' : `${report.social_metrics?.sentiment_score || 0}/100`}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Community Trust</div>
                <div className={`text-2xl font-bold ${
                  loadingStates.social ? 'text-gray-400' :
                  ((report.social_metrics?.community_trust || 0) * 100) >= 70 ? 'text-green-400' :
                  ((report.social_metrics?.community_trust || 0) * 100) >= 40 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {loadingStates.social ? '-' : `${((report.social_metrics?.community_trust || 0) * 100).toFixed(0)}%`}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm mb-1">Trending Score</div>
                <div className={`text-2xl font-bold ${
                  loadingStates.social ? 'text-gray-400' :
                  (report.social_metrics?.trending_score || 0) >= 70 ? 'text-green-400' :
                  (report.social_metrics?.trending_score || 0) >= 40 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {loadingStates.social ? '-' : `${report.social_metrics?.trending_score || 0}/100`}
                </div>
              </div>
            </div>
            {report.social_metrics?.summary && (
              <div className="text-gray-300 text-sm">
                {report.social_metrics.summary}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Links & Analysis</h3>
        <div className="grid grid-cols-1 gap-4">
          <motion.a
            variants={item}
            href={`https://dexscreener.com/solana/${report.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400"
          >
            <ExternalLink className="w-4 h-4" />
            View on DexScreener
          </motion.a>
        </div>
      </motion.div>

      <div className="absolute top-4 right-4">
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          {isSharing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Share2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </motion.div>
  );
}
