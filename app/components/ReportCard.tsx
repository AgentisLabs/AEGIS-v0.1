'use client';

import { Star, Shield, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface FirmReport {
  name: string;
  overall_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  sources: string[];
  twitter_sentiment?: {
    sentiment_score: number;
    summary: string;
    key_points: string[];
  };
}

interface ReportCardProps {
  report: FirmReport;
}

export function ReportCard({ report }: ReportCardProps) {
  const metrics = [
    { icon: Star, label: 'Overall Score', value: report.overall_score },
    { icon: Shield, label: 'Trust', value: report.twitter_sentiment?.sentiment_score || 0 },
    { icon: TrendingUp, label: 'Strengths', value: report.strengths.length },
    { icon: Users, label: 'Sources', value: report.sources.length },
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
          <h2 className="text-3xl font-bold mb-2">{report.name}</h2>
          <p className="text-gray-400">AI-Generated Analysis Report</p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-right"
        >
          <div className="text-4xl font-bold text-emerald-500">{report.overall_score}</div>
          <div className="text-gray-400">Overall Score</div>
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
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div className="text-gray-400">{label}</div>
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
            <h4 className="text-lg font-semibold mb-3 text-red-500">Weaknesses</h4>
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
    </motion.div>
  );
}
