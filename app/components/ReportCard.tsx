'use client';

import { useState, useEffect } from 'react';
import { Star, TrendingUp, Users, ExternalLink, Wallet, BarChart3, Activity, Link, ChartBar } from 'lucide-react';
import { motion } from 'framer-motion';
import { TokenAnalysis } from '../types';

interface ReportCardProps {
  report: TokenAnalysis;
}

export default function ReportCard({ report }: ReportCardProps) {
  const [loadingStates, setLoadingStates] = useState({
    basicInfo: true,
    marketData: true,
    analysis: true,
    social: true
  });

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

  const metrics = [
    { 
      icon: Star, 
      label: 'Overall Score', 
      value: report.overall_score 
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
      value: report.market_data?.market_metrics?.liquidity_score ? 
             `${Math.round(report.market_data.market_metrics.liquidity_score)}/100` : 
             'N/A',
      subValue: report.market_data?.market_metrics?.liquidity_usd ? 
                `$${new Intl.NumberFormat('en-US', {
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(report.market_data.market_metrics.liquidity_usd)}` : 
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
             '$0',
      subValue: report.market_data?.market_metrics?.marketCap ? 
                `MC: $${new Intl.NumberFormat('en-US', {
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(report.market_data.market_metrics.marketCap)}` : 
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 text-white border border-gray-800"
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
            report.overall_score >= 70 ? 'text-emerald-500' :
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
          <p className="text-gray-300 mb-6">{report.summary}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold mb-3 text-emerald-500">Strengths</h4>
            <div className="space-y-2">
              {loadingStates.analysis ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-800/30 animate-pulse rounded-lg" />
                ))
              ) : (
                report.strengths?.map((strength, i) => (
                  <motion.div
                    key={i}
                    variants={item}
                    className="flex items-center gap-2 bg-gray-800/30 p-3 rounded-lg border border-gray-800 hover:border-emerald-500/50 transition-colors duration-300"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-gray-300">{strength}</span>
                  </motion.div>
                )) || (
                  <div className="text-gray-400">No strengths identified</div>
                )
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3 text-red-500">Risk Factors</h4>
            <div className="space-y-2">
              {loadingStates.analysis ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-800/30 animate-pulse rounded-lg" />
                ))
              ) : (
                report.weaknesses?.map((weakness, i) => (
                  <motion.div
                    key={i}
                    variants={item}
                    className="flex items-center gap-2 bg-gray-800/30 p-3 rounded-lg border border-gray-800 hover:border-red-500/50 transition-colors duration-300"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-gray-300">{weakness}</span>
                  </motion.div>
                )) || (
                  <div className="text-gray-400">No risk factors identified</div>
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Risk Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
            <h4 className="text-lg font-semibold mb-3 text-orange-500">Risk Levels</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Overall Risk</span>
                <span className={`font-semibold px-3 py-1 rounded-full ${
                  loadingStates.analysis ? 'bg-gray-500/20 text-gray-400' :
                  report.risk_assessment?.level === 'extreme' ? 'bg-red-500/20 text-red-400' :
                  report.risk_assessment?.level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  report.risk_assessment?.level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {loadingStates.analysis ? 'Fetching...' :
                   report.risk_assessment?.level?.charAt(0).toUpperCase() + report.risk_assessment?.level?.slice(1) || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Liquidity Risk</span>
                <span className={`font-semibold px-3 py-1 rounded-full ${
                  loadingStates.analysis ? 'bg-gray-500/20 text-gray-400' :
                  report.risk_assessment?.liquidity_risk === 'high' ? 'bg-red-500/20 text-red-400' :
                  report.risk_assessment?.liquidity_risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {loadingStates.analysis ? 'Fetching...' :
                   report.risk_assessment?.liquidity_risk?.charAt(0).toUpperCase() + report.risk_assessment?.liquidity_risk?.slice(1) || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Volatility Risk</span>
                <span className={`font-semibold px-3 py-1 rounded-full ${
                  loadingStates.analysis ? 'bg-gray-500/20 text-gray-400' :
                  report.risk_assessment?.volatility_risk === 'high' ? 'bg-red-500/20 text-red-400' :
                  report.risk_assessment?.volatility_risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {loadingStates.analysis ? 'Fetching...' :
                   report.risk_assessment?.volatility_risk?.charAt(0).toUpperCase() + report.risk_assessment?.volatility_risk?.slice(1) || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Manipulation Risk</span>
                <span className={`font-semibold px-3 py-1 rounded-full ${
                  loadingStates.analysis ? 'bg-gray-500/20 text-gray-400' :
                  report.risk_assessment?.manipulation_risk === 'high' ? 'bg-red-500/20 text-red-400' :
                  report.risk_assessment?.manipulation_risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {loadingStates.analysis ? 'Fetching...' :
                   report.risk_assessment?.manipulation_risk?.charAt(0).toUpperCase() + report.risk_assessment?.manipulation_risk?.slice(1) || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
            <h4 className="text-lg font-semibold mb-3 text-blue-500">Market Assessment</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Price Trend</span>
                <span className={`font-semibold px-3 py-1 rounded-full ${
                  report.market_metrics?.price_trend === 'bullish' ? 'bg-green-500/20 text-green-400' :
                  report.market_metrics?.price_trend === 'bearish' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {report.market_metrics?.price_trend?.charAt(0).toUpperCase() + report.market_metrics?.price_trend?.slice(1) || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Liquidity</span>
                <span className={`font-semibold px-3 py-1 rounded-full ${
                  report.market_metrics?.liquidity_assessment === 'high' ? 'bg-green-500/20 text-green-400' :
                  report.market_metrics?.liquidity_assessment === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {report.market_metrics?.liquidity_assessment?.charAt(0).toUpperCase() + report.market_metrics?.liquidity_assessment?.slice(1) || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Trading Volume</span>
                <span className={`font-semibold px-3 py-1 rounded-full ${
                  report.market_metrics?.trading_volume === 'high' ? 'bg-green-500/20 text-green-400' :
                  report.market_metrics?.trading_volume === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {report.market_metrics?.trading_volume?.charAt(0).toUpperCase() + report.market_metrics?.trading_volume?.slice(1) || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Sustainability</span>
                <span className={`font-semibold px-3 py-1 rounded-full ${
                  report.market_metrics?.sustainability === 'sustainable' ? 'bg-green-500/20 text-green-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {report.market_metrics?.sustainability?.charAt(0).toUpperCase() + report.market_metrics?.sustainability?.slice(1) || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {report.social_metrics && (
        <motion.div variants={container} initial="hidden" animate="show" className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Social Sentiment</h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
              <h4 className="text-lg font-semibold mb-3 text-purple-500">Community Sentiment</h4>
              <div className="text-gray-300">
                <p>{report.social_metrics.summary}</p>
              </div>
            </div>

            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
              <h4 className="text-lg font-semibold mb-3 text-blue-500">Sentiment Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Sentiment</span>
                  <span className={`font-semibold px-3 py-1 rounded-full ${
                    report.social_metrics.sentiment_score > 0.3 ? 'bg-green-500/20 text-green-400' :
                    report.social_metrics.sentiment_score < -0.3 ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {report.social_metrics.sentiment_score > 0.3 ? 'Positive' :
                     report.social_metrics.sentiment_score < -0.3 ? 'Negative' :
                     'Mixed'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Community Trust</span>
                  <span className={`font-semibold px-3 py-1 rounded-full ${
                    report.social_metrics.community_trust > 0.7 ? 'bg-green-500/20 text-green-400' :
                    report.social_metrics.community_trust > 0.4 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {(report.social_metrics.community_trust * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Trending Score</span>
                  <span className={`font-semibold px-3 py-1 rounded-full ${
                    report.social_metrics.trending_score > 70 ? 'bg-green-500/20 text-green-400' :
                    report.social_metrics.trending_score > 30 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {report.social_metrics.trending_score}/100
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

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
    </motion.div>
  );
}
