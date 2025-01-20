import { Metadata } from 'next';
import { DAILY_SEARCH_LIMIT, DAILY_MESSAGE_LIMIT } from '../utils/db';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Documentation | AEGIS',
  description: 'Documentation and roadmap for AEGIS - AI-powered Solana token analysis'
};

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">AEGIS Documentation</h1>

      {/* Title and Version */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
          AEGIS: AI-Enabled Gateway for Intelligent Solana Operations
        </h2>
        <p className="text-xl text-gray-600">Whitepaper v0.1</p>
      </div>

      {/* System Architecture Diagram */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4 text-gray-900">System Architecture (v0.1) </h3>
        <div className="relative w-full h-[600px] mb-4">
          <Image
            src="/aegisflow.png"
            alt="AEGIS System Architecture"
            fill
            style={{ objectFit: 'contain' }}
            className="p-4"
            priority
          />
        </div>
        <p className="text-gray-600 text-sm italic text-center">
          AEGIS System Architecture and Agent Flow Diagram
        </p>
      </section>

      {/* Overview */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4 text-gray-900">Overview</h3>
        <div className="space-y-4">
          <p className="text-xl italic text-gray-800">&ldquo;Like the offspring of Crypto Twitter and a Bloomberg Terminal&rdquo;</p>
          <p className="text-gray-700">
            AEGIS, an AI-enabled gateway for Solana intelligence, aims to streamline the cryptocurrency research process. 
            By utilizing a team of specialized research agents and an execution agent (Wexley), AEGIS provides users with 
            the information needed to make informed investment decisions quickly.
          </p>
        </div>
      </section>

      {/* Current Features */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4 text-gray-900">Current Features</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-medium mb-3 text-blue-600">Multi-Agent Analysis System</h4>
            <p className="text-gray-700 mb-2">Specialized AI agents collaborate to analyze different aspects of tokens:</p>
            <ul className="list-disc ml-6 text-gray-700 space-y-2">
              <li>On-chain metrics analysis</li>
              <li>Social sentiment tracking</li>
              <li>Technical analysis</li>
              <li>Risk assessment</li>
              <li>Market dynamics evaluation</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3 text-blue-600">Wexley - Your AI Trading Companion</h4>
            <ul className="list-disc ml-6 text-gray-700 space-y-2">
              <li>Natural language trading execution</li>
              <li>Real-time chart analysis</li>
              <li>Twitter sentiment integration</li>
              <li>Trade execution via GMGN</li>
              <li>Degenerate yet data-driven insights</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3 text-blue-600">Advanced Trading Capabilities</h4>
            <ul className="list-disc ml-6 text-gray-700 space-y-2">
              <li>Natural language trade commands (e.g., &ldquo;buy 1 sol&rdquo;, &ldquo;sell half&rdquo;)</li>
              <li>GMGN integration for optimal execution</li>
              <li>Real-time price feeds</li>
              <li>Automated trade execution</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4 text-gray-900">Roadmap</h3>
        
        <div className="space-y-8">
          <div>
            <h4 className="text-xl font-medium mb-3 text-green-600">Phase 1: Foundation (Current) ✅</h4>
            <ul className="list-disc ml-6 text-gray-700 space-y-2">
              <li>Core natural language processing engine</li>
              <li>High-speed GMGN trade execution</li>
              <li>Basic token analysis</li>
              <li>Solana program integration</li>
              <li>Real-time market data</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3 text-blue-600">Phase 2: Enhancement (Q1-Q4 2025)</h4>
            <div className="space-y-4">
              <div>
                <h5 className="text-lg font-medium mb-2 text-gray-900">Advanced + Automated Analysis</h5>
                <ul className="list-disc ml-6 text-gray-700 space-y-2">
                  <li>Automated Token Screening</li>
                  <li>Periodic token scanning and ranking</li>
                  <li>Graph based agent framework for custom analysis flows</li>
                  <li>Granular control of scoring criteria</li>
                  <li>Vectorized token report repository</li>
                </ul>
              </div>

              <div>
                <h5 className="text-lg font-medium mb-2 text-gray-900">Advanced Execution Features</h5>
                <ul className="list-disc ml-6 text-gray-700 space-y-2">
                  <li>Automated execution on tokens that meet users criteria</li>
                  <li>Smart Execution (TWAP, VWAP, POV & Market Participation)</li>
                  <li>Risk aware trading with stop-loss and take-profit</li>
                  <li>Risk-adjusted position sizing</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3 text-purple-600">Phase 3: Expansion (2026+)</h4>
            <ul className="list-disc ml-6 text-gray-700 space-y-2">
              <li>Cross-chain integration</li>
              <li>ML-based pattern recognition</li>
              <li>Decentralized agent marketplace</li>
              <li>Community strategy sharing</li>
              <li>Institutional-grade analytics for all</li>
              <li>Advanced portfolio optimization</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4 text-gray-900">Links</h3>
        <div className="space-y-2">
          <a 
            href="https://www.agentislabs.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-blue-600 hover:text-blue-700"
          >
            https://www.agentislabs.ai
          </a>
          <a 
            href="https://agentis.sh" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-blue-600 hover:text-blue-700"
          >
            https://agentis.sh (AEGIS)
          </a>
        </div>
      </section>
    </div>
  );
} 