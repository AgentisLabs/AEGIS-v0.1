'use client';

import { useState } from 'react';
import { Star, TrendingUp, Users, ChevronDown, ChevronUp, ExternalLink, Wallet, BarChart3, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { TokenAnalysis } from '../types';

interface ReportCardProps {
  report: TokenAnalysis;
}

export default function ReportCard({ report }: ReportCardProps) {
  const [showSources, setShowSources] = useState(false);

  const metrics = [
    { icon: Star, label: 'Overall Score', value: report.overall_score },
    { icon: Activity, label: 'Price Trend', value: report.market_data?.price_trend || 'N/A' },
    { icon: BarChart3, label: 'Liquidity', value: report.market_data?.liquidity_assessment || 'N/A' },
    { icon: Wallet, label: 'Holders', value: report.chain_metrics?.total_holders || 'N/A' },
  ];

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
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
      >
        {metrics.map(({ icon: Icon, label, value }) => (
          <motion.div
            key={label}
            variants={item}
            className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-800 hover:border-cyan-500/50 transition-colors duration-300"
          >
            <Icon className="w-6 h-6 mx-auto mb-2 text-cyan-500" />
            <div className="text-xl font-bold mb-1">{value}</div>
            <div className="text-gray-400 text-sm">{label}</div>
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
