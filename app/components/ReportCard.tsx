'use client';

import { useState } from 'react';
import { Star, TrendingUp, Users, ChevronDown, ChevronUp, ExternalLink, Wallet, BarChart3, Activity, Link, ChartBar } from 'lucide-react';
import { motion } from 'framer-motion';
import { TokenAnalysis } from '../types';

interface ReportCardProps {
  report: TokenAnalysis;
}

export default function ReportCard({ report }: ReportCardProps) {
  const [showSources, setShowSources] = useState(false);

  // Add detailed console logging
  console.log('Full report data:', report);
  console.log('Market data:', report.market_data);
  console.log('Market metrics:', report.market_data?.market_metrics);
  console.log('Price trend:', report.market_data?.market_metrics?.price_trend);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 text-white border border-gray-800"
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            {report.name || 'Unknown Token'}
            <span className="text-gray-400 text-lg ml-2">{report.symbol}</span>
          </h2>
          <p className="text-sm font-mono text-gray-400 break-all">{report.address}</p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-right"
        >
          <div className={`text-4xl font-bold ${
            report.overall_score >= 70 ? 'text-emerald-500' :
            report.overall_score >= 50 ? 'text-yellow-500' :
            'text-red-500'
          }`}>{report.overall_score}</div>
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
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.subValue && (
              <div className="text-sm text-gray-400 mt-1">{metric.subValue}</div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show">
        <h3 className="text-xl font-semibold mb-4">Analysis Summary</h3>
        <p className="text-gray-300 mb-6">{report.summary}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold mb-3 text-emerald-500">Strengths</h4>
            <div className="space-y-2">
              {report.strengths.map((strength, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  className="flex items-center gap-2 bg-gray-800/30 p-3 rounded-lg border border-gray-800 hover:border-emerald-500/50 transition-colors duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-gray-300">{strength}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-3 text-red-500">Risk Factors</h4>
            <div className="space-y-2">
              {report.weaknesses.map((weakness, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  className="flex items-center gap-2 bg-gray-800/30 p-3 rounded-lg border border-gray-800 hover:border-red-500/50 transition-colors duration-300"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-gray-300">{weakness}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {report.social_metrics && (
        <motion.div variants={container} initial="hidden" animate="show" className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Social Sentiment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-800">
              <h4 className="text-lg font-semibold mb-3 text-blue-500">Community Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Sentiment</span>
                  <span className={`font-semibold ${
                    report.social_metrics.sentiment_score > 0 ? 'text-emerald-500' :
                    report.social_metrics.sentiment_score < 0 ? 'text-red-500' :
                    'text-yellow-500'
                  }`}>
                    {report.social_metrics.sentiment_score > 0 ? 'Positive' :
                     report.social_metrics.sentiment_score < 0 ? 'Negative' :
                     'Neutral'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">24h Mentions</span>
                  <span className="font-semibold text-white">{report.social_metrics.mentions_24h}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Community Trust</span>
                  <span className="font-semibold text-white">
                    {(report.social_metrics.community_trust * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {report.market_data?.market_metrics?.socials && (
        <motion.div variants={container} initial="hidden" animate="show" className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Links & Socials</h3>
          <div className="grid grid-cols-1 gap-4">
            {report.market_data.market_metrics.websites?.map((website, i) => (
              <motion.a
                key={i}
                variants={item}
                href={website.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400"
              >
                <ExternalLink className="w-4 h-4" />
                Website
              </motion.a>
            ))}
            {report.market_data.market_metrics.socials?.map((social, i) => (
              <motion.a
                key={i}
                variants={item}
                href={`https://${social.platform}.com/${social.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400"
              >
                <ExternalLink className="w-4 h-4" />
                {social.platform}: {social.handle}
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="mt-8">
        <button
          onClick={() => setShowSources(!showSources)}
          className="flex items-center justify-between w-full text-left text-gray-400 hover:text-white transition-colors duration-300"
        >
          <span className="text-lg font-semibold">Sources & References</span>
          {showSources ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {showSources && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-2"
          >
            {report.sources.map((source, i) => (
              <motion.a
                key={i}
                variants={item}
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cyan-500 hover:text-cyan-400 transition-colors duration-300"
              >
                <ExternalLink className="w-4 h-4" />
                {source}
              </motion.a>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
